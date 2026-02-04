/**
 * AST Utilities for Inertia Code Transforms
 *
 * This module provides utilities for parsing and analyzing JavaScript/TypeScript code
 * to find Inertia-specific patterns. We use Vite's built-in `parseAst` (which uses
 * Rollup's parser under the hood) to parse code into an ESTree-compatible AST.
 *
 * The main class `ParsedCode` wraps a parsed AST and provides methods to:
 * - Detect which Inertia framework adapter is being used (Vue, React, Svelte)
 * - Find `createInertiaApp()` or `createInertiaApp()` calls
 * - Extract the `pages` property for transformation
 * - Find calls that need a default resolver injected
 */

import type { CallExpression, ExpressionStatement, Identifier, ObjectExpression, Property, Program, SimpleCallExpression } from 'estree'
import { parseAst } from 'vite'
import type { FrameworkConfig } from './types'

/**
 * Augments an ESTree node type with position information.
 * Rollup's parser adds `start` and `end` properties to nodes,
 * which we need for string slicing during code transformation.
 */
export type NodeWithPos<T> = T & { start: number; end: number }

/**
 * The function name that indicates an Inertia app configuration.
 * We look for calls to this function to determine where to apply transforms.
 */
const INERTIA_APP_FUNCTION = 'createInertiaApp'

/**
 * The function name for the legacy SSR server pattern.
 * We need to detect `createServer(...)` calls to add export default for backwards compatibility.
 */
const CREATE_SERVER_FUNCTION = 'createServer'

/**
 * Represents a standalone Inertia call at the module level.
 * Used for SSR transform where we need to wrap the entire statement.
 *
 * Example of what this matches:
 * ```js
 * createInertiaApp({ resolve: name => name })  // ← This entire statement
 * ```
 */
export interface InertiaStatement {
  statement: NodeWithPos<ExpressionStatement>
  call: NodeWithPos<SimpleCallExpression>
}

/**
 * Position information for the options object in an Inertia call.
 * Used when injecting a default resolver into existing calls.
 */
export interface InertiaCallOptions {
  start: number
  end: number
  isEmpty: boolean
}

/**
 * Wrapper around a parsed AST that provides Inertia-specific analysis methods.
 *
 * Usage:
 * ```ts
 * const parsed = ParsedCode.from(code)
 * if (parsed) {
 *   const framework = parsed.detectFramework(frameworks)
 *   const pages = parsed.pagesProperty
 * }
 * ```
 */
export class ParsedCode {
  private constructor(private ast: Program) {}

  /**
   * Parse JavaScript/TypeScript code into a ParsedCode instance.
   * Returns null if parsing fails (invalid syntax).
   */
  static from(code: string): ParsedCode | null {
    try {
      return new ParsedCode(parseAst(code))
    } catch {
      return null
    }
  }

  /**
   * Extract all import source strings from the code.
   *
   * For example, given:
   * ```js
   * import { createInertiaApp } from '@inertiajs/vue3'
   * import { Head } from '@inertiajs/vue3'
   * ```
   *
   * Returns: ['@inertiajs/vue3', '@inertiajs/vue3']
   */
  get importSources(): string[] {
    const sources: string[] = []

    for (const node of this.ast.body) {
      if (node.type === 'ImportDeclaration') {
        sources.push(node.source.value as string)
      }
    }

    return sources
  }

  /**
   * Detect which Inertia framework adapter is being used by checking imports.
   *
   * Looks for imports from known framework packages (e.g., '@inertiajs/vue3')
   * and returns the matching framework configuration.
   */
  detectFramework(frameworks: Record<string, FrameworkConfig>): { name: string; config: FrameworkConfig } | null {
    const name = this.importSources.find((source) => source in frameworks)

    return name ? { name, config: frameworks[name] } : null
  }

  /**
   * Find a top-level Inertia call statement (not inside any function or export).
   *
   * This is used for SSR transform, which needs to wrap code like:
   * ```js
   * createInertiaApp({ ... })
   * ```
   *
   * Into:
   * ```js
   * const render = await createInertiaApp({ ... })
   * createServer((page) => render(page, renderToString))
   * ```
   *
   * Note: This specifically looks for ExpressionStatements, NOT export defaults.
   * The SSR entry file should have a bare call, not `export default createInertiaApp()`.
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
   * Find a top-level createServer() call statement that doesn't have an export.
   *
   * This is used for backwards compatibility with the legacy SSR pattern:
   * ```js
   * createServer((page) => createInertiaApp({ page, render, ... }))
   * ```
   *
   * We need to transform this to:
   * ```js
   * export default createServer((page) => createInertiaApp({ page, render, ... }))
   * ```
   *
   * So that Vite's SSR dev mode can access the render function.
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
   * Find ALL Inertia calls anywhere in the code (including nested).
   *
   * This is used for pages transform, which needs to find calls like:
   * ```js
   * export default createInertiaApp({ pages: './Pages' })
   * ```
   *
   * The call might be inside an export, function, or other expression,
   * so we walk the entire AST to find all matches.
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
   * Find the `pages` property in an Inertia call's options object.
   *
   * Looks for patterns like:
   * ```js
   * createInertiaApp({ pages: './Pages' })
   * createInertiaApp({ pages: { path: './Pages', extension: '.vue' } })
   * ```
   *
   * Returns the Property node with position info so we can replace it
   * with a generated `resolve` function.
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

        const property = prop as NodeWithPos<Property>

        // Ensure we have position info for string replacement
        if (property.start !== undefined && property.end !== undefined) {
          return property
        }
      }
    }

    return null
  }

  /**
   * Find an Inertia call that doesn't have a `pages` or `resolve` property.
   *
   * This is used to inject a default resolver for calls like:
   * ```js
   * createInertiaApp()                    // Empty call
   * createInertiaApp({})                  // Empty options
   * createInertiaApp({ title: t => t })   // Options but no resolver
   * ```
   *
   * Returns position info needed to inject the resolver:
   * - `callEnd`: Position of the closing `)` for empty calls
   * - `options`: Position of the `{}` for calls with options
   */
  get callWithoutResolver(): { callEnd: number; options?: InertiaCallOptions } | null {
    for (const call of this.inertiaCalls) {
      const callee = call.callee as NodeWithPos<Identifier>
      const callWithPos = call as NodeWithPos<CallExpression>

      if (callee.end === undefined || callWithPos.end === undefined) {
        continue
      }

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
        (p) => p.type === 'Property' && p.key.type === 'Identifier' && (p.key.name === 'pages' || p.key.name === 'resolve'),
      )

      if (hasResolver || obj.start === undefined || obj.end === undefined) {
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

  /**
   * Check if a call expression is an Inertia app configuration call.
   */
  private isInertiaCall(node: CallExpression | SimpleCallExpression): boolean {
    return node.callee.type === 'Identifier' && (node.callee as Identifier).name === INERTIA_APP_FUNCTION
  }

  /**
   * Recursively walk all nodes in the AST and call the callback for each.
   * This is a simple depth-first traversal that handles both arrays and objects.
   */
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
