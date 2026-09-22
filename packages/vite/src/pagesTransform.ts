/**
 * Pages Transform
 *
 * This module transforms the `pages` shorthand into a full `resolve` function.
 * Instead of writing verbose glob code in every project, users can simply write:
 *
 * ```js
 * createInertiaApp({ pages: './Pages' })
 * ```
 *
 * Which gets transformed into:
 *
 * ```js
 * createInertiaApp({
 *   resolve: async (name, page) => {
 *     const pages = import.meta.glob('./Pages/*.vue')
 *     const module = await (pages[`./Pages/${name}.vue`])?.()
 *     if (!module) throw new Error(`Page not found: ${name}`)
 *     return module.default ?? module
 *   }
 * })
 * ```
 *
 * The transform also supports advanced configuration:
 *
 * ```js
 * createInertiaApp({
 *   pages: {
 *     path: './Pages',
 *     extension: '.tsx',
 *     lazy: true,
 *     transform: (name, page) => name.replace('/', '-')
 *   }
 * })
 * ```
 */

import type { Property } from 'estree'
import MagicString from 'magic-string'
import { type NodeWithPos, ParsedCode, extractBoolean, extractString, extractStringArray } from './astUtils'
import { replaceRange } from './sourceMap'
import type { FrameworkConfig } from './types'

export interface PageTransformResult {
  code: MagicString
  pageGlobs: string[]
}

/** Returns the transformed code with page globs, or null if no transformation was needed. */
export function transformPageResolution(
  code: string,
  frameworks: Record<string, FrameworkConfig>,
): PageTransformResult | null {
  if (!code.includes('InertiaApp')) {
    return null
  }

  const parsed = ParsedCode.from(code)

  if (!parsed) {
    return null
  }

  const framework = parsed.detectFramework(frameworks)

  if (!framework) {
    return null
  }

  const extensions = framework.config.extensions
  const extractDefault = framework.config.extractDefault ?? true

  if (parsed.pagesProperty) {
    const result = replacePages(code, parsed.pagesProperty, extensions, extractDefault)

    return result ? { code: result.code, pageGlobs: result.globs } : null
  }

  if (parsed.callWithoutResolver) {
    const defaultGlobs = buildDefaultGlobs(extensions)

    return {
      code: injectResolver(code, parsed.callWithoutResolver, extensions, extractDefault),
      pageGlobs: defaultGlobs,
    }
  }

  return null
}

/**
 * Replace the `pages` property with a generated `resolve` function.
 *
 * Input:  `{ pages: './Pages', title: t => t }`
 * Output: `{ resolve: async (name, page) => { ... }, title: t => t }`
 */
function replacePages(
  code: string,
  property: NodeWithPos<Property>,
  defaultExtensions: string[],
  extractDefault: boolean,
): { code: MagicString; globs: string[] } | null {
  const config = extractPagesConfig(property.value)

  if (!config) {
    return null
  }

  const extensions = config.extensions
    ? Array.isArray(config.extensions)
      ? config.extensions
      : [config.extensions]
    : defaultExtensions

  const eager = !(config.lazy ?? true)

  const directories = config.directory ? [config.directory.replace(/\/$/, '')] : ['./pages', './Pages']

  const transform = config.transform ? code.slice(config.transform.start, config.transform.end) : undefined
  const resolver = buildResolver(directories, extensions, extractDefault, eager, transform)
  const globs = directories.map((d) => buildGlob(d, extensions))
  const result = new MagicString(code)

  if (config.transform && transform) {
    const offset = resolver.indexOf(RESOLVED_NAME_PREFIX) + RESOLVED_NAME_PREFIX.length

    replaceRange(result, property.start, config.transform.start, resolver.slice(0, offset))
    replaceRange(result, config.transform.end, property.end, resolver.slice(offset + transform.length))
  } else {
    replaceRange(result, property.start, property.end, resolver)
  }

  return {
    code: result,
    globs,
  }
}

/**
 * Inject a default resolver into a call that doesn't have one.
 *
 * Handles three cases:
 * 1. Empty call:    `createInertiaApp()`    becomes `createInertiaApp({ resolve: ... })`
 * 2. Empty object:  `createInertiaApp({})`  becomes `createInertiaApp({ resolve: ... })`
 * 3. Other options: `createInertiaApp({a})` becomes `createInertiaApp({ resolve: ..., a})`
 */
function injectResolver(
  code: string,
  call: { callEnd: number; options?: { start: number; end: number; isEmpty: boolean } },
  extensions: string[],
  extractDefault: boolean,
): MagicString {
  const resolver = buildDefaultResolver(extensions, extractDefault)
  const result = new MagicString(code)

  if (!call.options) {
    return result.appendLeft(call.callEnd - 1, `{ ${resolver} }`)
  }

  if (call.options.isEmpty) {
    result.remove(call.options.start + 1, call.options.end - 1)
    return result.appendLeft(call.options.start + 1, ` ${resolver} `)
  }

  return result.appendLeft(call.options.start + 1, ` ${resolver},`)
}

/** The parsed representation of a `pages` property value. */
interface PagesConfig {
  directory?: string
  extensions?: string | string[]
  transform?: NodeWithPos<Property['value']>
  lazy?: boolean
}

/**
 * Extract configuration from the `pages` property value.
 *
 * Supports two formats:
 * 1. String: `pages: './Pages'`
 * 2. Object: `pages: { path: './Pages', extension: '.vue', lazy: true, transform: fn }`
 */
function extractPagesConfig(node: Property['value']): PagesConfig | null {
  const str = extractString(node)

  if (str) {
    return { directory: str }
  }

  if (node.type !== 'ObjectExpression') {
    return null
  }

  let directory: string | undefined
  let extensions: string | string[] | undefined
  let transform: NodeWithPos<Property['value']> | undefined
  let lazy: boolean | undefined

  for (const prop of node.properties) {
    if (prop.type !== 'Property' || prop.key.type !== 'Identifier') {
      continue
    }

    const key = prop.key.name
    const value = prop.value as NodeWithPos<Property['value']>

    if (key === 'path') {
      directory = extractString(value)
    } else if (key === 'extension') {
      extensions = extractString(value) ?? extractStringArray(value)
    } else if (key === 'transform') {
      transform = value
    } else if (key === 'lazy') {
      lazy = extractBoolean(value)
    }
  }

  return { directory, extensions, transform, lazy }
}

function buildResolver(
  directories: string | string[],
  extensions: string[],
  extractDefault: boolean,
  eager: boolean,
  transform?: string,
): string {
  const dirs = Array.isArray(directories) ? directories : [directories]

  const globs = dirs.map((d) => buildGlob(d, extensions))
  const glob = globs.length === 1 ? `'${globs[0]}'` : `['${globs.join("', '")}']`

  const nameVar = transform ? 'resolvedName' : 'name'
  const lookup = dirs.flatMap((d) => extensions.map((ext) => `pages[\`${d}/\${${nameVar}}${ext}\`]`)).join(' || ')

  const transformLine = transform ? `${RESOLVED_NAME_PREFIX}${transform})(name, page)\n    ` : ''

  const returnValue = extractDefault ? 'module.default ?? module' : 'module'

  const globOptions = `, { eager: ${eager} }`
  const moduleLookup = eager ? lookup : `await (${lookup})?.()`

  return `resolve: async (name, page) => {
    ${transformLine}const pages = import.meta.glob(${glob}${globOptions})
    const module = ${moduleLookup}
    if (!module) throw new Error(\`Page not found: \${name}\`)
    return ${returnValue}
  }`
}

const DEFAULT_PAGE_DIRECTORIES = ['./pages', './Pages']
const RESOLVED_NAME_PREFIX = 'const resolvedName = ('

function buildDefaultResolver(extensions: string[], extractDefault: boolean, eager: boolean = false): string {
  return buildResolver(DEFAULT_PAGE_DIRECTORIES, extensions, extractDefault, eager)
}

function buildDefaultGlobs(extensions: string[]): string[] {
  return DEFAULT_PAGE_DIRECTORIES.map((d) => buildGlob(d, extensions))
}

function buildGlob(directory: string, extensions: string[]): string {
  const ext = extensions.length === 1 ? extensions[0] : `{${extensions.join(',')}}`

  return `${directory}/**/*${ext}`
}
