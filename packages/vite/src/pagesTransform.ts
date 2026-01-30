import type { CallExpression, Identifier, ObjectExpression, Property } from 'estree'
import { type NodeWithPos, ParsedCode } from './astUtils'

export function transformPageResolution(code: string): string | null {
  if (!code.includes('InertiaApp')) {
    return null
  }

  const parsed = ParsedCode.from(code)

  if (!parsed?.framework) {
    return null
  }

  const pagesProperty = findPagesProperty(parsed, code)

  if (pagesProperty) {
    return replaceWithResolver(code, pagesProperty, parsed.extensions)
  }

  const call = findCallNeedingResolver(parsed)

  if (call) {
    return injectDefaultResolver(code, call, parsed.extensions)
  }

  return null
}

interface PagesProperty {
  start: number
  end: number
  directory: string
  extensions?: string | string[]
  transform?: string
}

function findPagesProperty(parsed: ParsedCode, code: string): PagesProperty | null {
  for (const call of parsed.findInertiaCalls()) {
    if (call.arguments.length === 0 || call.arguments[0].type !== 'ObjectExpression') {
      continue
    }

    for (const prop of (call.arguments[0] as ObjectExpression).properties) {
      if (prop.type !== 'Property' || prop.key.type !== 'Identifier' || prop.key.name !== 'pages') {
        continue
      }

      const property = prop as NodeWithPos<Property>

      if (property.start === undefined || property.end === undefined) {
        continue
      }

      const result = extractPagesConfig(property.value, code)

      if (result) {
        return { start: property.start, end: property.end, ...result }
      }
    }
  }

  return null
}

function extractPagesConfig(
  node: Property['value'],
  code: string,
): { directory: string; extensions?: string | string[]; transform?: string } | null {
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

function replaceWithResolver(code: string, property: PagesProperty, defaultExtensions: string[]): string {
  const directory = property.directory.replace(/\/$/, '')
  const extensions = property.extensions
    ? (Array.isArray(property.extensions) ? property.extensions : [property.extensions])
    : defaultExtensions

  return code.slice(0, property.start) + buildResolver(directory, extensions, property.transform) + code.slice(property.end)
}

interface CallNeedingResolver {
  argsStart: number
  argsEnd: number
  objectStart?: number
  objectEnd?: number
  hasProperties: boolean
}

function findCallNeedingResolver(parsed: ParsedCode): CallNeedingResolver | null {
  for (const call of parsed.findInertiaCalls()) {
    const callee = call.callee as NodeWithPos<Identifier>
    const callWithPos = call as NodeWithPos<CallExpression>

    if (callee.end === undefined || callWithPos.end === undefined) {
      continue
    }

    if (call.arguments.length === 0) {
      return { argsStart: callee.end, argsEnd: callWithPos.end, hasProperties: false }
    }

    if (call.arguments[0].type !== 'ObjectExpression') {
      continue
    }

    const obj = call.arguments[0] as NodeWithPos<ObjectExpression>
    const hasExisting = obj.properties.some(
      (p) => p.type === 'Property' && p.key.type === 'Identifier' && (p.key.name === 'pages' || p.key.name === 'resolve'),
    )

    if (hasExisting || obj.start === undefined || obj.end === undefined) {
      continue
    }

    return {
      argsStart: callee.end,
      argsEnd: callWithPos.end,
      objectStart: obj.start,
      objectEnd: obj.end,
      hasProperties: obj.properties.length > 0,
    }
  }

  return null
}

function injectDefaultResolver(code: string, call: CallNeedingResolver, extensions: string[]): string {
  const resolver = buildDefaultResolver(extensions)

  if (!call.objectStart) {
    return code.slice(0, call.argsStart) + `({ ${resolver} })` + code.slice(call.argsEnd)
  }

  if (!call.hasProperties) {
    return code.slice(0, call.objectStart) + `{ ${resolver} }` + code.slice(call.objectEnd)
  }

  return code.slice(0, call.objectStart + 1) + ` ${resolver},` + code.slice(call.objectStart + 1)
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
