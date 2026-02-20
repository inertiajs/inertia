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
 *     const pages = import.meta.glob('./Pages/*.vue', { eager: true })
 *     const module = pages[`./Pages/${name}.vue`]
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
import { type NodeWithPos, ParsedCode } from './astUtils'
import type { FrameworkConfig } from './types'

/**
 * Main entry point for the pages transform.
 *
 * Returns the transformed code, or null if no transformation was needed.
 */
export function transformPageResolution(code: string, frameworks: Record<string, FrameworkConfig>): string | null {
  // Quick check to avoid parsing files that definitely don't contain Inertia code
  if (!code.includes('InertiaApp')) {
    return null
  }

  const parsed = ParsedCode.from(code)

  if (!parsed) {
    return null
  }

  // Detect which framework is being used (Vue, React, Svelte, or custom)
  const framework = parsed.detectFramework(frameworks)

  if (!framework) {
    return null
  }

  // Get framework-specific settings
  const extensions = framework.config.extensions
  const extractDefault = framework.config.extractDefault ?? true

  // Case 1: User specified `pages: './Pages'` or `pages: { path: './Pages' }`
  // Replace the entire `pages` property with a generated `resolve` function
  if (parsed.pagesProperty) {
    return replacePages(code, parsed.pagesProperty, extensions, extractDefault)
  }

  // Case 2: User has a call without any resolver (no `pages` or `resolve` property)
  // Inject a default resolver that looks in ./pages and ./Pages directories
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

  // Use custom extensions if provided, otherwise use framework defaults
  const extensions = config.extensions
    ? Array.isArray(config.extensions)
      ? config.extensions
      : [config.extensions]
    : defaultExtensions

  // Default to eager loading (synchronous imports) for better performance
  const eager = !(config.lazy ?? false)

  // Build the resolver function based on the configuration
  const resolver = config.directory
    ? buildResolver(config.directory.replace(/\/$/, ''), extensions, extractDefault, eager, config.transform)
    : buildDefaultResolver(extensions, extractDefault, eager)

  // Replace the `pages: ...` property with the generated `resolve: ...` function
  return code.slice(0, property.start) + resolver + code.slice(property.end)
}

/**
 * Inject a default resolver into a call that doesn't have one.
 *
 * Handles three cases:
 * 1. Empty call:    `createInertiaApp()`     → `createInertiaApp({ resolve: ... })`
 * 2. Empty object:  `createInertiaApp({})`   → `createInertiaApp({ resolve: ... })`
 * 3. Other options: `createInertiaApp({a})` → `createInertiaApp({ resolve: ..., a})`
 */
function injectResolver(
  code: string,
  call: { callEnd: number; options?: { start: number; end: number; isEmpty: boolean } },
  extensions: string[],
  extractDefault: boolean,
): string {
  const resolver = buildDefaultResolver(extensions, extractDefault)

  // Case 1: No arguments - insert `{ resolver }` before the closing `)`
  if (!call.options) {
    return code.slice(0, call.callEnd - 1) + `{ ${resolver} })` + code.slice(call.callEnd)
  }

  // Case 2: Empty object `{}` - replace with `{ resolver }`
  if (call.options.isEmpty) {
    return code.slice(0, call.options.start) + `{ ${resolver} }` + code.slice(call.options.end)
  }

  // Case 3: Object with other properties - prepend resolver
  return code.slice(0, call.options.start + 1) + ` ${resolver},` + code.slice(call.options.start + 1)
}

/**
 * Configuration extracted from the `pages` property value.
 */
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
  // Simple string format: `pages: './Pages'`
  const str = extractString(node)

  if (str) {
    return { directory: str }
  }

  // Object format: `pages: { path: './Pages', ... }`
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
      // Supports both `extension: '.vue'` and `extension: ['.tsx', '.jsx']`
      extensions = extractString(value) ?? extractStringArray(value)
    } else if (key === 'transform' && value.start !== undefined && value.end !== undefined) {
      // For transform, we preserve the raw source code (could be arrow function, etc.)
      transform = code.slice(value.start, value.end)
    } else if (key === 'lazy') {
      lazy = extractBoolean(value)
    }
  }

  // Must have either a directory or lazy setting to be valid
  if (!directory && lazy === undefined) {
    return null
  }

  return { directory, extensions, transform, lazy }
}

/**
 * Extract a string value from an AST node.
 * Handles both regular strings ('foo') and template literals (`foo`).
 */
function extractString(node: Property['value']): string | undefined {
  if (node.type === 'Literal' && typeof node.value === 'string') {
    return node.value
  }

  // Template literal without expressions: `./Pages`
  if (node.type === 'TemplateLiteral' && node.expressions.length === 0) {
    return node.quasis[0].value.cooked ?? node.quasis[0].value.raw
  }

  return undefined
}

/**
 * Extract a string array from an AST node.
 * Handles: `['.tsx', '.jsx']`
 */
function extractStringArray(node: Property['value']): string[] | undefined {
  if (node.type !== 'ArrayExpression') {
    return undefined
  }

  return node.elements
    .filter((el): el is typeof el & { value: string } => el?.type === 'Literal' && typeof el.value === 'string')
    .map((el) => el.value)
}

/**
 * Extract a boolean value from an AST node.
 */
function extractBoolean(node: Property['value']): boolean | undefined {
  if (node.type === 'Literal' && typeof node.value === 'boolean') {
    return node.value
  }

  return undefined
}

/**
 * Build the resolve function code string.
 *
 * This generates code like:
 * ```js
 * resolve: async (name, page) => {
 *   const pages = import.meta.glob('./Pages/*.vue', { eager: true })
 *   const module = pages[`./Pages/${name}.vue`]
 *   if (!module) throw new Error(`Page not found: ${name}`)
 *   return module.default ?? module
 * }
 * ```
 *
 * @param directories - Directory or directories to search for pages
 * @param extensions - File extensions to include in the glob
 * @param extractDefault - Whether to extract `.default` from the module (Vue/React need this, Svelte doesn't)
 * @param eager - Whether to use eager loading (synchronous) or lazy loading (dynamic import)
 * @param transform - Optional transform function to modify the page name
 */
function buildResolver(
  directories: string | string[],
  extensions: string[],
  extractDefault: boolean,
  eager: boolean,
  transform?: string,
): string {
  const dirs = Array.isArray(directories) ? directories : [directories]

  // Build glob patterns: './Pages/**/*.vue' or ['./pages/**/*.vue', './Pages/**/*.vue']
  const globs = dirs.map((d) => buildGlob(d, extensions))
  const glob = globs.length === 1 ? `'${globs[0]}'` : `['${globs.join("', '")}']`

  // If transform is provided, we use `resolvedName` after applying the transform
  const nameVar = transform ? 'resolvedName' : 'name'

  // Build the module lookup: pages[`./Pages/${name}.vue`] || pages[`./Pages/${name}.jsx`]
  const lookup = dirs.flatMap((d) => extensions.map((ext) => `pages[\`${d}/\${${nameVar}}${ext}\`]`)).join(' || ')

  // Optional transform line: const resolvedName = (transform)(name, page)
  const transformLine = transform ? `const resolvedName = (${transform})(name, page)\n    ` : ''

  // Vue/React export components as default, Svelte exports the component directly
  const returnValue = extractDefault ? 'module.default ?? module' : 'module'

  // Eager mode loads all modules upfront, lazy mode uses dynamic import()
  const globOptions = eager ? ', { eager: true }' : ''
  const moduleLookup = eager ? lookup : `await (${lookup})?.()`

  return `resolve: async (name, page) => {
    ${transformLine}const pages = import.meta.glob(${glob}${globOptions})
    const module = ${moduleLookup}
    if (!module) throw new Error(\`Page not found: \${name}\`)
    return ${returnValue}
  }`
}

/**
 * Build a resolver that searches both ./pages and ./Pages directories.
 * This is the default when no custom path is specified.
 */
function buildDefaultResolver(extensions: string[], extractDefault: boolean, eager: boolean = true): string {
  return buildResolver(['./pages', './Pages'], extensions, extractDefault, eager)
}

// Build a glob pattern for Vite's import.meta.glob
// Single extension: ./Pages/**/*.vue
// Multiple extensions: ./Pages/**/*{.tsx,.jsx}
function buildGlob(directory: string, extensions: string[]): string {
  const ext = extensions.length === 1 ? extensions[0] : `{${extensions.join(',')}}`

  return `${directory}/**/*${ext}`
}
