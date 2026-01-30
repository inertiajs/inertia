import type { Property } from 'estree'
import { type NodeWithPos, ParsedCode } from './astUtils'

export function transformPageResolution(code: string): string | null {
  if (!code.includes('InertiaApp')) {
    return null
  }

  const parsed = ParsedCode.from(code)

  if (!parsed?.framework) {
    return null
  }

  if (parsed.pagesProperty) {
    return replacePages(code, parsed.pagesProperty, parsed.extensions)
  }

  if (parsed.callWithoutResolver) {
    return injectResolver(code, parsed.callWithoutResolver, parsed.extensions)
  }

  return null
}

function replacePages(code: string, property: NodeWithPos<Property>, defaultExtensions: string[]): string {
  const config = extractPagesConfig(property.value, code)

  if (!config) {
    return code
  }

  const directory = config.directory.replace(/\/$/, '')
  const extensions = config.extensions
    ? (Array.isArray(config.extensions) ? config.extensions : [config.extensions])
    : defaultExtensions

  const resolver = buildResolver(directory, extensions, config.transform)

  return code.slice(0, property.start) + resolver + code.slice(property.end)
}

function injectResolver(
  code: string,
  call: { callEnd: number; options?: { start: number; end: number; isEmpty: boolean } },
  extensions: string[],
): string {
  const resolver = buildDefaultResolver(extensions)

  if (!call.options) {
    return code.slice(0, call.callEnd - 1) + `{ ${resolver} }` + code.slice(call.callEnd)
  }

  if (call.options.isEmpty) {
    return code.slice(0, call.options.start) + `{ ${resolver} }` + code.slice(call.options.end)
  }

  return code.slice(0, call.options.start + 1) + ` ${resolver},` + code.slice(call.options.start + 1)
}

interface PagesConfig {
  directory: string
  extensions?: string | string[]
  transform?: string
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
    }
  }

  return directory ? { directory, extensions, transform } : null
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

function buildResolver(directory: string, extensions: string[], transform?: string): string {
  const glob = buildGlob(directory, extensions)
  const nameVar = transform ? 'resolvedName' : 'name'
  const lookup = extensions.map((ext) => `pages[\`${directory}/\${${nameVar}}${ext}\`]`).join(' || ')
  const transformLine = transform ? `const resolvedName = (${transform})(name)\n    ` : ''

  return `resolve: async (name) => {
    ${transformLine}const pages = import.meta.glob('${glob}')
    const page = await (${lookup})?.()
    if (!page) throw new Error(\`Page not found: \${name}\`)
    return page.default ?? page
  }`
}

function buildDefaultResolver(extensions: string[]): string {
  const dirs = ['./pages', './Pages']
  const globs = dirs.map((d) => buildGlob(d, extensions))
  const lookup = dirs.flatMap((d) => extensions.map((e) => `pages[\`${d}/\${name}${e}\`]`)).join(' || ')

  return `resolve: async (name) => {
    const pages = import.meta.glob(['${globs.join("', '")}'])
    const page = await (${lookup})?.()
    if (!page) throw new Error(\`Page not found: \${name}\`)
    return page.default ?? page
  }`
}

function buildGlob(directory: string, extensions: string[]): string {
  const ext = extensions.length === 1 ? extensions[0] : `{${extensions.join(',')}}`

  return `${directory}/**/*${ext}`
}
