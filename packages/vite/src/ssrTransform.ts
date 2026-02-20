/**
 * SSR Transform
 *
 * Transforms the SSR entry file by wrapping `createInertiaApp()` with
 * framework-specific server bootstrap code, so users don't need to
 * write the boilerplate manually.
 */

import { ParsedCode } from './astUtils'
import type { FrameworkConfig, SSROptions } from './types'

/**
 * Returns empty string if no options, otherwise `, {"port":13715}`.
 */
function formatSSROptions(options: SSROptions): string {
  const entries = Object.entries(options).filter(([, v]) => v !== undefined)

  return entries.length > 0 ? `, ${JSON.stringify(Object.fromEntries(entries))}` : ''
}

/**
 * Quick check for a top-level `createInertiaApp()` or `createServer()` call
 * that needs SSR wrapping. Does not match exported calls.
 */
export function findInertiaAppExport(code: string): boolean {
  const parsed = ParsedCode.from(code)
  return !!(parsed?.inertiaStatement || parsed?.createServerStatement)
}

/**
 * Wrap `createInertiaApp()` with the framework's SSR template.
 * Also handles the explicit `createServer()` pattern.
 */
export function wrapWithServerBootstrap(
  code: string,
  options: SSROptions,
  frameworks: Record<string, FrameworkConfig>,
): string | null {
  const parsed = ParsedCode.from(code)

  if (!parsed) {
    return null
  }

  // Handle the new pattern: bare createInertiaApp() call
  if (parsed.inertiaStatement) {
    // Detect framework and ensure it has SSR support
    const framework = parsed.detectFramework(frameworks)

    if (!framework?.config.ssr) {
      return null
    }

    // Extract the original createInertiaApp(...) call as a string
    const { statement, call } = parsed.inertiaStatement
    const configureCall = code.slice(call.start, call.end)

    // Apply the framework's SSR template to wrap the call
    const ssrCode = framework.config.ssr(configureCall, formatSSROptions(options)).trim()

    // Replace the original statement with the wrapped version
    // This preserves any code before/after the Inertia call
    return code.slice(0, statement.start) + ssrCode + code.slice(statement.end)
  }

  // Handle the explicit createServer() pattern
  if (parsed.createServerStatement) {
    const statement = parsed.createServerStatement
    const args = (statement.expression as unknown as { arguments: Array<{ start: number; end: number }> }).arguments
    const callback = code.slice(args[0].start, args[0].end)
    const trailingArgs = code.slice(args[0].end, args[args.length - 1].end)

    const replacement = `const renderPage = ${callback}

if (import.meta.env.PROD) {
  createServer(renderPage${trailingArgs})
}

export default renderPage`

    return code.slice(0, statement.start) + replacement + code.slice(statement.end)
  }

  return null
}
