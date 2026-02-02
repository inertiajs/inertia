import type { CallExpression, ExpressionStatement, Identifier, ObjectExpression, Property, Program, SimpleCallExpression } from 'estree'
import { parseAst } from 'vite'
import type { FrameworkConfig } from './types'

export type NodeWithPos<T> = T & { start: number; end: number }

const INERTIA_APP_FUNCTIONS = ['configureInertiaApp', 'createInertiaApp']

export interface InertiaStatement {
  statement: NodeWithPos<ExpressionStatement>
  call: NodeWithPos<SimpleCallExpression>
}

export interface InertiaCallOptions {
  start: number
  end: number
  isEmpty: boolean
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

  get importSources(): string[] {
    const sources: string[] = []

    for (const node of this.ast.body) {
      if (node.type === 'ImportDeclaration') {
        sources.push(node.source.value as string)
      }
    }

    return sources
  }

  detectFramework(frameworks: Record<string, FrameworkConfig>): { name: string; config: FrameworkConfig } | null {
    const name = this.importSources.find((source) => source in frameworks)

    return name ? { name, config: frameworks[name] } : null
  }

  get inertiaStatement(): InertiaStatement | null {
    for (const node of this.ast.body) {
      if (node.type !== 'ExpressionStatement') {
        continue
      }

      const statement = node as NodeWithPos<ExpressionStatement>
      let expr = statement.expression as { type: string; argument?: unknown; start: number; end: number }

      if (expr.type === 'AwaitExpression') {
        expr = expr.argument as typeof expr
      }

      if (expr.type === 'CallExpression') {
        const call = expr as NodeWithPos<SimpleCallExpression>

        if (this.isInertiaCall(call)) {
          return { statement, call }
        }
      }
    }

    return null
  }

  get inertiaCalls(): CallExpression[] {
    const calls: CallExpression[] = []

    this.walkAst(this.ast, (node) => {
      if (node.type === 'CallExpression' && this.isInertiaCall(node as CallExpression)) {
        calls.push(node as CallExpression)
      }
    })

    return calls
  }

  get pagesProperty(): NodeWithPos<Property> | null {
    for (const call of this.inertiaCalls) {
      if (call.arguments.length === 0 || call.arguments[0].type !== 'ObjectExpression') {
        continue
      }

      for (const prop of (call.arguments[0] as ObjectExpression).properties) {
        if (prop.type !== 'Property' || prop.key.type !== 'Identifier' || prop.key.name !== 'pages') {
          continue
        }

        const property = prop as NodeWithPos<Property>

        if (property.start !== undefined && property.end !== undefined) {
          return property
        }
      }
    }

    return null
  }

  get callWithoutResolver(): { callEnd: number; options?: InertiaCallOptions } | null {
    for (const call of this.inertiaCalls) {
      const callee = call.callee as NodeWithPos<Identifier>
      const callWithPos = call as NodeWithPos<CallExpression>

      if (callee.end === undefined || callWithPos.end === undefined) {
        continue
      }

      if (call.arguments.length === 0) {
        return { callEnd: callWithPos.end }
      }

      if (call.arguments[0].type !== 'ObjectExpression') {
        continue
      }

      const obj = call.arguments[0] as NodeWithPos<ObjectExpression>
      const hasResolver = obj.properties.some(
        (p) => p.type === 'Property' && p.key.type === 'Identifier' && (p.key.name === 'pages' || p.key.name === 'resolve'),
      )

      if (hasResolver || obj.start === undefined || obj.end === undefined) {
        continue
      }

      return {
        callEnd: callWithPos.end,
        options: { start: obj.start, end: obj.end, isEmpty: obj.properties.length === 0 },
      }
    }

    return null
  }

  private isInertiaCall(node: CallExpression | SimpleCallExpression): boolean {
    return node.callee.type === 'Identifier' && INERTIA_APP_FUNCTIONS.includes((node.callee as Identifier).name)
  }

  private walkAst(node: unknown, callback: (node: { type: string }) => void): void {
    if (!node || typeof node !== 'object') {
      return
    }

    if ('type' in node) {
      callback(node as { type: string })
    }

    for (const value of Object.values(node as Record<string, unknown>)) {
      if (Array.isArray(value)) {
        for (const item of value) {
          this.walkAst(item, callback)
        }
      } else {
        this.walkAst(value, callback)
      }
    }
  }
}
