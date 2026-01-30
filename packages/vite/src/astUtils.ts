import type { CallExpression, ExpressionStatement, Identifier, Program, SimpleCallExpression } from 'estree'
import { parseAst } from 'vite'

export type NodeWithPos<T> = T & { start: number; end: number }

const INERTIA_APP_FUNCTIONS = ['configureInertiaApp', 'createInertiaApp']

const FRAMEWORKS: Record<string, { extensions: string[]; serverRenderer?: string }> = {
  '@inertiajs/vue3': { extensions: ['.vue'], serverRenderer: 'vue/server-renderer' },
  '@inertiajs/react': { extensions: ['.tsx', '.jsx'], serverRenderer: 'react-dom/server' },
  '@inertiajs/svelte': { extensions: ['.svelte'] },
}

export class ParsedCode {
  private constructor(private ast: Program) {}

  static from(code: string): ParsedCode | null {
    try {
      return new ParsedCode(parseAst(code))
    } catch {
      return null
    }
  }

  get framework(): string | null {
    for (const node of this.ast.body) {
      if (node.type === 'ImportDeclaration') {
        const source = node.source.value as string

        if (source in FRAMEWORKS) {
          return source
        }
      }
    }

    return null
  }

  get extensions(): string[] {
    return this.framework ? FRAMEWORKS[this.framework].extensions : []
  }

  get serverRenderer(): string | null {
    return this.framework ? (FRAMEWORKS[this.framework].serverRenderer ?? null) : null
  }

  findInertiaCall(): { statementNode: NodeWithPos<ExpressionStatement>; callNode: NodeWithPos<SimpleCallExpression> } | null {
    for (const node of this.ast.body) {
      if (node.type !== 'ExpressionStatement') {
        continue
      }

      const statementNode = node as NodeWithPos<ExpressionStatement>
      let expr = statementNode.expression as { type: string; argument?: unknown; start: number; end: number }

      if (expr.type === 'AwaitExpression') {
        expr = expr.argument as typeof expr
      }

      if (expr.type === 'CallExpression') {
        const callNode = expr as NodeWithPos<SimpleCallExpression>

        if (callNode.callee.type === 'Identifier' && INERTIA_APP_FUNCTIONS.includes((callNode.callee as Identifier).name)) {
          return { statementNode, callNode }
        }
      }
    }

    return null
  }

  *findInertiaCalls(): Generator<CallExpression> {
    for (const node of this.walk()) {
      if (node.type === 'CallExpression') {
        const call = node as unknown as CallExpression

        if (call.callee.type === 'Identifier' && INERTIA_APP_FUNCTIONS.includes(call.callee.name)) {
          yield call
        }
      }
    }
  }

  private *walk(node: unknown = this.ast): Generator<{ type: string }> {
    if (!node || typeof node !== 'object') {
      return
    }

    if ('type' in node) {
      yield node as { type: string }
    }

    for (const value of Object.values(node as Record<string, unknown>)) {
      if (Array.isArray(value)) {
        for (const item of value) {
          yield* this.walk(item)
        }
      } else {
        yield* this.walk(value)
      }
    }
  }
}
