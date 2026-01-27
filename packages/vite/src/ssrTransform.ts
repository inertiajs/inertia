import type { ExportDefaultDeclaration, Identifier, Program, SimpleCallExpression } from 'estree'
import { parseAst } from 'vite'
import type { InertiaSSROptions } from './ssr'

type NodeWithPos<T> = T & { start: number; end: number }

const INERTIA_APP_FUNCTIONS = ['configureInertiaApp', 'createInertiaApp']

export function findInertiaAppExport(code: string): boolean {
  const ast = safeParse(code)

  if (!ast) {
    return false
  }

  return findExportedCall(ast) !== null
}

export function wrapWithServerBootstrap(code: string, options: InertiaSSROptions): string | null {
  const ast = safeParse(code)

  if (!ast) {
    return null
  }

  const match = findExportedCall(ast)

  if (!match) {
    return null
  }

  const { exportNode, callNode } = match
  const callCode = code.slice(callNode.start, callNode.end)
  const configArg = buildConfigArg(options)

  const replacement = `import __inertia_createServer__ from '@inertiajs/core/server'
const __inertia_render__ = await ${callCode}
__inertia_createServer__(__inertia_render__${configArg})
export default __inertia_render__`

  return code.slice(0, exportNode.start) + replacement + code.slice(exportNode.end)
}

function safeParse(code: string): Program | null {
  try {
    return parseAst(code)
  } catch {
    return null
  }
}

interface ExportedCall {
  exportNode: NodeWithPos<ExportDefaultDeclaration>
  callNode: NodeWithPos<SimpleCallExpression>
}

function findExportedCall(ast: Program): ExportedCall | null {
  for (const node of ast.body) {
    if (node.type !== 'ExportDefaultDeclaration') {
      continue
    }

    const exportNode = node as NodeWithPos<ExportDefaultDeclaration>
    let declaration = exportNode.declaration

    if (declaration.type === 'AwaitExpression') {
      declaration = declaration.argument
    }

    if (declaration.type !== 'CallExpression') {
      continue
    }

    const callNode = declaration as NodeWithPos<SimpleCallExpression>

    if (callNode.callee.type !== 'Identifier') {
      continue
    }

    if (INERTIA_APP_FUNCTIONS.includes((callNode.callee as Identifier).name)) {
      return { exportNode, callNode }
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
