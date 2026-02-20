/**
 * AST Utilities for Inertia Code Transforms
 *
 * Parses JavaScript/TypeScript code using Vite's built-in `parseAst` (Rollup's parser)
 * and provides methods to find Inertia-specific patterns like `createInertiaApp()` calls,
 * framework detection, and property extraction.
 */

import type {
  CallExpression,
  ExpressionStatement,
  Identifier,
  ObjectExpression,
  Program,
  Property,
  SimpleCallExpression,
} from 'estree'
import { parseAst } from 'vite'
import type { FrameworkConfig } from './types'

/**
 * Augments an ESTree node type with `start` and `end` position info
 * added by Rollup's parser, needed for string slicing during transforms.
 */
export type NodeWithPos<T> = T & { start: number; end: number }

const INERTIA_APP_FUNCTION = 'createInertiaApp'
const CREATE_SERVER_FUNCTION = 'createServer'

/**
 * A top-level `createInertiaApp()` expression statement with position info.
 */
export interface InertiaStatement {
  statement: NodeWithPos<ExpressionStatement>
  call: NodeWithPos<SimpleCallExpression>
}

/**
 * Position info for the options object in a `createInertiaApp()` call.
 */
export interface InertiaCallOptions {
  start: number
  end: number
  isEmpty: boolean
}

/**
 * Wrapper around a parsed AST that provides Inertia-specific analysis methods.
 */
export class ParsedCode {
  private constructor(private ast: Program) {}

  /**
   * Returns null if parsing fails.
   */
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

  /**
   * Find a top-level `createInertiaApp()` expression statement.
   * Only matches bare calls, not `export default createInertiaApp()`.
   */
  get inertiaStatement(): InertiaStatement | null {
    for (const node of this.ast.body) {
      if (node.type !== 'ExpressionStatement') {
        continue
      }

      const statement = node as NodeWithPos<ExpressionStatement>
      let expr = statement.expression as { type: string; argument?: unknown; start: number; end: number }

      // Handle `await createInertiaApp()` - unwrap the await to get the call
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

  /**
   * Find a top-level `createServer()` expression statement.
   */
  get createServerStatement(): NodeWithPos<ExpressionStatement> | null {
    for (const node of this.ast.body) {
      if (node.type !== 'ExpressionStatement') {
        continue
      }

      const statement = node as NodeWithPos<ExpressionStatement>
      const expr = statement.expression

      if (expr.type === 'CallExpression') {
        const call = expr as SimpleCallExpression

        if (call.callee.type === 'Identifier' && (call.callee as Identifier).name === CREATE_SERVER_FUNCTION) {
          return statement
        }
      }
    }

    return null
  }

  /**
   * Find all `createInertiaApp()` calls anywhere in the AST (including nested in exports).
   */
  get inertiaCalls(): CallExpression[] {
    const calls: CallExpression[] = []

    this.walkAst(this.ast, (node) => {
      if (node.type === 'CallExpression' && this.isInertiaCall(node as CallExpression)) {
        calls.push(node as CallExpression)
      }
    })

    return calls
  }

  /**
   * Find the `pages` property in a `createInertiaApp()` call's options.
   */
  get pagesProperty(): NodeWithPos<Property> | null {
    for (const call of this.inertiaCalls) {
      // Skip calls without arguments or with non-object first argument
      if (call.arguments.length === 0 || call.arguments[0].type !== 'ObjectExpression') {
        continue
      }

      // Look for a `pages` property in the options object
      for (const prop of (call.arguments[0] as ObjectExpression).properties) {
        if (prop.type !== 'Property' || prop.key.type !== 'Identifier' || prop.key.name !== 'pages') {
          continue
        }

        return prop as NodeWithPos<Property>
      }
    }

    return null
  }

  /**
   * Find a `createInertiaApp()` call that has no `pages` or `resolve` property.
   */
  get callWithoutResolver(): { callEnd: number; options?: InertiaCallOptions } | null {
    for (const call of this.inertiaCalls) {
      const callWithPos = call as NodeWithPos<CallExpression>

      // Empty call: createInertiaApp()
      if (call.arguments.length === 0) {
        return { callEnd: callWithPos.end }
      }

      // Non-object argument - can't inject resolver
      if (call.arguments[0].type !== 'ObjectExpression') {
        continue
      }

      const obj = call.arguments[0] as NodeWithPos<ObjectExpression>

      // Check if it already has a pages or resolve property
      const hasResolver = obj.properties.some(
        (p) =>
          p.type === 'Property' && p.key.type === 'Identifier' && (p.key.name === 'pages' || p.key.name === 'resolve'),
      )

      if (hasResolver) {
        continue
      }

      // Found a call with options but no resolver
      return {
        callEnd: callWithPos.end,
        options: { start: obj.start, end: obj.end, isEmpty: obj.properties.length === 0 },
      }
    }

    return null
  }

  private isInertiaCall(node: CallExpression | SimpleCallExpression): boolean {
    return node.callee.type === 'Identifier' && (node.callee as Identifier).name === INERTIA_APP_FUNCTION
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

/**
 * Extract a string value from an AST node.
 * Handles regular strings and simple template literals.
 */
export function extractString(node: Property['value']): string | undefined {
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
 */
export function extractStringArray(node: Property['value']): string[] | undefined {
  if (node.type !== 'ArrayExpression') {
    return undefined
  }

  const strings = node.elements
    .map((el) => (el ? extractString(el as Property['value']) : undefined))
    .filter((s): s is string => s !== undefined)

  return strings.length > 0 ? strings : undefined
}

export function extractBoolean(node: Property['value']): boolean | undefined {
  if (node.type === 'Literal' && typeof node.value === 'boolean') {
    return node.value
  }

  return undefined
}
