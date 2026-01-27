import type { CallExpression, Identifier, ObjectExpression, Program, Property } from 'estree'
import { parseAst } from 'vite'

type NodeWithPos<T> = T & { start: number; end: number }

interface PagesConfig {
  path: string
  extension?: string | string[]
  transform?: string
}

const INERTIA_APP_FUNCTIONS = ['configureInertiaApp', 'createInertiaApp']

const FRAMEWORK_EXTENSIONS: Record<string, string[]> = {
  '@inertiajs/vue3': ['.vue'],
  '@inertiajs/react': ['.tsx', '.jsx'],
  '@inertiajs/svelte': ['.svelte'],
}

export function transformPageResolution(code: string): string | null {
  if (!code.includes('InertiaApp')) {
    return null
  }

  const ast = safeParse(code)

  if (!ast) {
    return null
  }

  const extensions = detectFrameworkExtensions(ast)

  if (!extensions) {
    return null
  }

  const pagesProperty = findPagesProperty(ast, code)

  if (pagesProperty) {
    return replaceWithResolver(code, pagesProperty, extensions)
  }

  const call = findCallNeedingResolver(ast)

  if (call) {
    return injectDefaultResolver(code, call, extensions)
  }

  return null
}

function safeParse(code: string): Program | null {
  try {
    return parseAst(code)
  } catch {
    return null
  }
}

function detectFrameworkExtensions(ast: Program): string[] | null {
  for (const node of ast.body) {
    if (node.type === 'ImportDeclaration') {
      const source = node.source.value as string

      if (FRAMEWORK_EXTENSIONS[source]) {
        return FRAMEWORK_EXTENSIONS[source]
      }
    }
  }

  return null
}

interface PagesProperty {
  start: number
  end: number
  value: string | PagesConfig
}

function findPagesProperty(ast: Program, code: string): PagesProperty | null {
  for (const call of findInertiaCalls(ast)) {
    if (call.arguments.length === 0 || call.arguments[0].type !== 'ObjectExpression') {
      continue
    }

    const obj = call.arguments[0] as ObjectExpression

    for (const prop of obj.properties) {
      if (prop.type !== 'Property') {
        continue
      }

      if (!isIdentifier(prop.key, 'pages')) {
        continue
      }

      const property = prop as NodeWithPos<Property>

      if (property.start === undefined || property.end === undefined) {
        continue
      }

      const value = extractPagesValue(property.value, code)

      if (value !== null) {
        return { start: property.start, end: property.end, value }
      }
    }
  }

  return null
}

function extractPagesValue(node: Property['value'], code: string): string | PagesConfig | null {
  if (node.type === 'Literal' && typeof node.value === 'string') {
    return node.value
  }

  if (node.type === 'TemplateLiteral' && node.expressions.length === 0) {
    return node.quasis[0].value.cooked ?? node.quasis[0].value.raw
  }

  if (node.type === 'ObjectExpression') {
    return extractPagesConfig(node, code)
  }

  return null
}

function extractPagesConfig(obj: ObjectExpression, code: string): PagesConfig | null {
  const config: Partial<PagesConfig> = {}

  for (const prop of obj.properties) {
    if (prop.type !== 'Property' || prop.key.type !== 'Identifier') {
      continue
    }

    const key = prop.key.name
    const value = prop.value

    if (key === 'path') {
      config.path = extractString(value)
    } else if (key === 'extension') {
      config.extension = extractStringOrArray(value)
    } else if (key === 'transform') {
      const valueWithPos = value as NodeWithPos<typeof value>

      if (valueWithPos.start !== undefined && valueWithPos.end !== undefined) {
        config.transform = code.slice(valueWithPos.start, valueWithPos.end)
      }
    }
  }

  return config.path ? (config as PagesConfig) : null
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

function extractStringOrArray(node: Property['value']): string | string[] | undefined {
  const str = extractString(node)

  if (str) {
    return str
  }

  if (node.type === 'ArrayExpression') {
    return node.elements
      .filter((el): el is typeof el & { value: string } => el?.type === 'Literal' && typeof el.value === 'string')
      .map((el) => el.value)
  }

  return undefined
}

function replaceWithResolver(code: string, property: PagesProperty, defaultExtensions: string[]): string {
  const config = normalizeConfig(property.value, defaultExtensions)

  if (!config) {
    return code
  }

  return code.slice(0, property.start) + buildResolver(config) + code.slice(property.end)
}

interface CallNeedingResolver {
  emptyArgs: boolean
  emptyObject: boolean
  argsStart: number
  argsEnd: number
  objectStart?: number
  objectEnd?: number
}

function findCallNeedingResolver(ast: Program): CallNeedingResolver | null {
  for (const call of findInertiaCalls(ast)) {
    const callee = call.callee as NodeWithPos<Identifier>
    const callWithPos = call as NodeWithPos<CallExpression>

    if (callee.end === undefined || callWithPos.end === undefined) {
      continue
    }

    if (call.arguments.length === 0) {
      return {
        emptyArgs: true,
        emptyObject: false,
        argsStart: callee.end,
        argsEnd: callWithPos.end,
      }
    }

    if (call.arguments[0].type !== 'ObjectExpression') {
      continue
    }

    const obj = call.arguments[0] as NodeWithPos<ObjectExpression>

    if (hasProperty(obj, 'pages') || hasProperty(obj, 'resolve')) {
      continue
    }

    if (obj.start === undefined || obj.end === undefined) {
      continue
    }

    return {
      emptyArgs: false,
      emptyObject: obj.properties.length === 0,
      argsStart: callee.end,
      argsEnd: callWithPos.end,
      objectStart: obj.start,
      objectEnd: obj.end,
    }
  }

  return null
}

function injectDefaultResolver(code: string, call: CallNeedingResolver, extensions: string[]): string {
  const resolver = buildDefaultResolver(extensions)

  if (call.emptyArgs) {
    return code.slice(0, call.argsStart) + `({ ${resolver} })` + code.slice(call.argsEnd)
  }

  if (call.emptyObject) {
    return code.slice(0, call.objectStart) + `{ ${resolver} }` + code.slice(call.objectEnd)
  }

  return code.slice(0, call.objectStart! + 1) + ` ${resolver},` + code.slice(call.objectStart! + 1)
}

function normalizeConfig(
  value: string | PagesConfig,
  defaultExtensions: string[],
): { directory: string; extensions: string[]; transform?: string } | null {
  const directory = typeof value === 'string' ? value : value.path
  const extension = typeof value === 'string' ? undefined : value.extension
  const transform = typeof value === 'string' ? undefined : value.transform

  return {
    directory: directory.replace(/\/$/, ''),
    extensions: extension ? (Array.isArray(extension) ? extension : [extension]) : defaultExtensions,
    transform,
  }
}

function buildResolver(config: { directory: string; extensions: string[]; transform?: string }): string {
  const { directory, extensions, transform } = config
  const glob = globPattern(directory, extensions)
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
  const directories = ['./pages', './Pages']
  const globs = directories.map((dir) => globPattern(dir, extensions))
  const lookup = directories.flatMap((dir) => extensions.map((ext) => `pages[\`${dir}/\${name}${ext}\`]`)).join(' || ')

  return `resolve: async (name) => {
    const pages = import.meta.glob(['${globs.join("', '")}'])
    const page = await (${lookup})?.()
    if (!page) throw new Error(\`Page not found: \${name}\`)
    return page.default ?? page
  }`
}

function globPattern(directory: string, extensions: string[]): string {
  const ext = extensions.length === 1 ? extensions[0] : `{${extensions.join(',')}}`

  return `${directory}/**/*${ext}`
}

function* findInertiaCalls(ast: Program): Generator<CallExpression> {
  for (const node of walkAst(ast)) {
    if (node.type !== 'CallExpression') {
      continue
    }

    const call = node as unknown as CallExpression

    if (call.callee.type === 'Identifier' && INERTIA_APP_FUNCTIONS.includes(call.callee.name)) {
      yield call
    }
  }
}

function hasProperty(obj: ObjectExpression, name: string): boolean {
  return obj.properties.some((prop) => prop.type === 'Property' && isIdentifier(prop.key, name))
}

function isIdentifier(node: Property['key'], name: string): boolean {
  return node.type === 'Identifier' && node.name === name
}

type AstNode = { type: string; [key: string]: unknown }

function* walkAst(node: unknown): Generator<AstNode> {
  if (!node || typeof node !== 'object') {
    return
  }

  if ('type' in node) {
    yield node as AstNode
  }

  for (const value of Object.values(node as Record<string, unknown>)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        yield* walkAst(item)
      }
    } else {
      yield* walkAst(value)
    }
  }
}
