import type { ExpressionStatement, Identifier, ImportDeclaration, Program, SimpleCallExpression } from 'estree'
import { parseAst } from 'vite'
import type { InertiaSSROptions } from './ssr'

type NodeWithPos<T> = T & { start: number; end: number }

const INERTIA_APP_FUNCTIONS = ['configureInertiaApp', 'createInertiaApp']

const SERVER_RENDERERS: Record<string, string> = {
  '@inertiajs/react': 'react-dom/server',
  '@inertiajs/vue3': 'vue/server-renderer',
}

export function findInertiaAppExport(code: string): boolean {
  const ast = safeParse(code)

  if (!ast) {
    return false
  }

  return findInertiaCall(ast) !== null
}

export function wrapWithServerBootstrap(code: string, options: InertiaSSROptions): string | null {
  const ast = safeParse(code)

  if (!ast) {
    return null
  }

  const match = findInertiaCall(ast)

  if (!match) {
    return null
  }

  const callCode = code.slice(match.callNode.start, match.callNode.end)
  const configArg = buildConfigArg(options)
  const framework = detectFramework(ast)
  const rendererModule = framework ? SERVER_RENDERERS[framework] : null

  const rendererImport = rendererModule
    ? `import { renderToString as __inertia_renderToString__ } from '${rendererModule}'\n`
    : ''

  const renderWrapper = rendererModule
    ? `const __inertia_render__ = (page) => __inertia_app__(page, __inertia_renderToString__)`
    : `const __inertia_render__ = __inertia_app__`

  const replacement = `import __inertia_createServer__ from '@inertiajs/core/server'
${rendererImport}const __inertia_app__ = await ${callCode}
${renderWrapper}
__inertia_createServer__(__inertia_render__${configArg})
export default __inertia_render__`

  return code.slice(0, match.statementNode.start) + replacement + code.slice(match.statementNode.end)
}

function safeParse(code: string): Program | null {
  try {
    return parseAst(code)
  } catch {
    return null
  }
}

interface InertiaCall {
  statementNode: NodeWithPos<ExpressionStatement>
  callNode: NodeWithPos<SimpleCallExpression>
}

function findInertiaCall(ast: Program): InertiaCall | null {
  for (const node of ast.body) {
    if (node.type !== 'ExpressionStatement') {
      continue
    }

    const exprNode = node as NodeWithPos<ExpressionStatement>
    const callNode = extractCallExpression(exprNode.expression)

    if (callNode && isInertiaAppCall(callNode)) {
      return { statementNode: exprNode, callNode }
    }
  }

  return null
}

function extractCallExpression(node: unknown): NodeWithPos<SimpleCallExpression> | null {
  let expr = node as { type: string; argument?: unknown; start: number; end: number }

  if (expr.type === 'AwaitExpression') {
    expr = expr.argument as typeof expr
  }

  if (expr.type === 'CallExpression') {
    return expr as NodeWithPos<SimpleCallExpression>
  }

  return null
}

function isInertiaAppCall(node: SimpleCallExpression): boolean {
  return node.callee.type === 'Identifier' && INERTIA_APP_FUNCTIONS.includes((node.callee as Identifier).name)
}

function detectFramework(ast: Program): string | null {
  for (const node of ast.body) {
    if (node.type !== 'ImportDeclaration') {
      continue
    }

    const source = (node as ImportDeclaration).source.value as string

    if (source in SERVER_RENDERERS) {
      return source
    }
  }

  return null
}

function buildConfigArg(options: InertiaSSROptions): string {
  const config: Record<string, unknown> = {}

  if (options.port !== undefined) {
    config.port = options.port
  }

  if (options.cluster !== undefined) {
    config.cluster = options.cluster
  }

  return Object.keys(config).length > 0 ? `, ${JSON.stringify(config)}` : ''
}
