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
 * Quick check for a top-level call that needs SSR wrapping.
 */
export function findInertiaAppExport(code: string): boolean {
  const parsed = ParsedCode.from(code)
  return !!(parsed?.inertiaStatement || parsed?.createServerStatement)
}

/**
 * Wrap `createInertiaApp()` or `createServer()` with the framework's SSR bootstrap.
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

  if (parsed.inertiaStatement) {
    const framework = parsed.detectFramework(frameworks)

    if (!framework?.config.ssr) {
      return null
    }

    const { statement, call } = parsed.inertiaStatement
    const configureCall = code.slice(call.start, call.end)
    const ssrCode = framework.config.ssr(configureCall, formatSSROptions(options)).trim()

    return code.slice(0, statement.start) + ssrCode + code.slice(statement.end)
  }

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
