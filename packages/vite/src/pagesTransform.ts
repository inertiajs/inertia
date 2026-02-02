import type { Property } from 'estree'
import { type NodeWithPos, ParsedCode } from './astUtils'
import type { FrameworkConfig } from './types'

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

function replacePages(code: string, property: NodeWithPos<Property>, defaultExtensions: string[], extractDefault: boolean): string {
  const config = extractPagesConfig(property.value, code)

  if (!config) {
    return code
  }

  const extensions = config.extensions
    ? (Array.isArray(config.extensions) ? config.extensions : [config.extensions])
    : defaultExtensions
  const eager = config.eager ?? true

  const resolver = config.directory
    ? buildResolver(config.directory.replace(/\/$/, ''), extensions, extractDefault, eager, config.transform)
    : buildDefaultResolver(extensions, extractDefault, eager)

  return code.slice(0, property.start) + resolver + code.slice(property.end)
}

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

interface PagesConfig {
  directory?: string
  extensions?: string | string[]
  transform?: string
  eager?: boolean
}

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
  let eager: boolean | undefined

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
    } else if (key === 'transform' && value.start !== undefined && value.end !== undefined) {
      transform = code.slice(value.start, value.end)
    } else if (key === 'eager') {
      eager = extractBoolean(value)
    }
  }

  if (!directory && eager === undefined) {
    return null
  }

  return { directory, extensions, transform, eager }
}

function extractString(node: Property['value']): string | undefined {
  if (node.type === 'Literal' && typeof node.value === 'string') {
    return node.value
  }

  if (node.type === 'TemplateLiteral' && node.expressions.length === 0) {
    return node.quasis[0].value.cooked ?? node.quasis[0].value.raw
  }

  return undefined
}

function extractStringArray(node: Property['value']): string[] | undefined {
  if (node.type !== 'ArrayExpression') {
    return undefined
  }

  return node.elements
    .filter((el): el is typeof el & { value: string } => el?.type === 'Literal' && typeof el.value === 'string')
    .map((el) => el.value)
}

function extractBoolean(node: Property['value']): boolean | undefined {
  if (node.type === 'Literal' && typeof node.value === 'boolean') {
    return node.value
  }

  return undefined
}

function buildResolver(directories: string | string[], extensions: string[], extractDefault: boolean, eager: boolean, transform?: string): string {
  const dirs = Array.isArray(directories) ? directories : [directories]
  const globs = dirs.map((d) => buildGlob(d, extensions))
  const glob = globs.length === 1 ? `'${globs[0]}'` : `['${globs.join("', '")}']`
  const nameVar = transform ? 'resolvedName' : 'name'
  const lookup = dirs.flatMap((d) => extensions.map((ext) => `pages[\`${d}/\${${nameVar}}${ext}\`]`)).join(' || ')
  const transformLine = transform ? `const resolvedName = (${transform})(name, page)\n    ` : ''
  const returnValue = extractDefault ? 'module.default ?? module' : 'module'

  const globOptions = eager ? ', { eager: true }' : ''
  const moduleLookup = eager ? lookup : `await (${lookup})?.()`

  return `resolve: async (name, page) => {
    ${transformLine}const pages = import.meta.glob(${glob}${globOptions})
    const module = ${moduleLookup}
    if (!module) throw new Error(\`Page not found: \${name}\`)
    return ${returnValue}
  }`
}

function buildDefaultResolver(extensions: string[], extractDefault: boolean, eager: boolean = true): string {
  return buildResolver(['./pages', './Pages'], extensions, extractDefault, eager)
}

function buildGlob(directory: string, extensions: string[]): string {
  const ext = extensions.length === 1 ? extensions[0] : `{${extensions.join(',')}}`

  return `${directory}/**/*${ext}`
}
