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
import { type NodeWithPos, ParsedCode, extractBoolean, extractString, extractStringArray } from './astUtils'
import type { FrameworkConfig } from './types'

/** Returns the transformed code, or null if no transformation was needed. */
export function transformPageResolution(code: string, frameworks: Record<string, FrameworkConfig>): string | null {
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
    return replacePages(code, parsed.pagesProperty, extensions, extractDefault)
  }

  if (parsed.callWithoutResolver) {
    return injectResolver(code, parsed.callWithoutResolver, extensions, extractDefault)
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
): string {
  const config = extractPagesConfig(property.value, code)

  if (!config) {
    return code
  }

  const extensions = config.extensions
    ? Array.isArray(config.extensions)
      ? config.extensions
      : [config.extensions]
    : defaultExtensions

  const eager = !(config.lazy ?? true)

  const resolver = config.directory
    ? buildResolver(config.directory.replace(/\/$/, ''), extensions, extractDefault, eager, config.transform)
    : buildDefaultResolver(extensions, extractDefault, eager)

  return code.slice(0, property.start) + resolver + code.slice(property.end)
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
): string {
  const resolver = buildDefaultResolver(extensions, extractDefault)

  if (!call.options) {
    return code.slice(0, call.callEnd - 1) + `{ ${resolver} })` + code.slice(call.callEnd)
  }

  if (call.options.isEmpty) {
    return code.slice(0, call.options.start) + `{ ${resolver} }` + code.slice(call.options.end)
  }

  return code.slice(0, call.options.start + 1) + ` ${resolver},` + code.slice(call.options.start + 1)
}

/** The parsed representation of a `pages` property value. */
interface PagesConfig {
  directory?: string
  extensions?: string | string[]
  transform?: string
  lazy?: boolean
}

/**
 * Extract configuration from the `pages` property value.
 *
 * Supports two formats:
 * 1. String: `pages: './Pages'`
 * 2. Object: `pages: { path: './Pages', extension: '.vue', lazy: true, transform: fn }`
 */
function extractPagesConfig(node: Property['value'], code: string): PagesConfig | null {
  const str = extractString(node)

  if (str) {
    return { directory: str }
  }

  if (node.type !== 'ObjectExpression') {
    return null
  }

  let directory: string | undefined
  let extensions: string | string[] | undefined
  let transform: string | undefined
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
      transform = code.slice(value.start, value.end)
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

  const transformLine = transform ? `const resolvedName = (${transform})(name, page)\n    ` : ''

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

function buildDefaultResolver(extensions: string[], extractDefault: boolean, eager: boolean = false): string {
  return buildResolver(['./pages', './Pages'], extensions, extractDefault, eager)
}

function buildGlob(directory: string, extensions: string[]): string {
  const ext = extensions.length === 1 ? extensions[0] : `{${extensions.join(',')}}`

  return `${directory}/**/*${ext}`
}
