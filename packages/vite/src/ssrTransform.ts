/**
 * SSR Transform
 *
 * Transforms the SSR entry file by wrapping `createInertiaApp()` with
 * framework-specific server bootstrap code, so users don't need to
 * write the boilerplate manually.
 */

import MagicString from 'magic-string'
import { type NodeWithPos, ParsedCode } from './astUtils'
import { replaceRange } from './sourceMap'
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
): MagicString | null {
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

    const result = new MagicString(code)
    // Custom templates may rewrite the call. Only map an unchanged expression.
    const generatedCall = ParsedCode.from(ssrCode)?.inertiaCalls.find((candidate) => {
      const { start, end } = candidate as NodeWithPos<typeof candidate>
      return ssrCode.slice(start, end) === configureCall
    }) as NodeWithPos<typeof call> | undefined

    if (generatedCall) {
      replaceRange(result, statement.start, call.start, ssrCode.slice(0, generatedCall.start))
      replaceRange(result, call.end, statement.end, ssrCode.slice(generatedCall.end))
    } else {
      replaceRange(result, statement.start, statement.end, ssrCode)
    }

    return result
  }

  if (parsed.createServerStatement) {
    const statement = parsed.createServerStatement
    const args = (statement.expression as unknown as { arguments: Array<{ start: number; end: number }> }).arguments
    const callback = args[0]
    const lastArgument = args[args.length - 1]
    const result = new MagicString(code)

    result.remove(statement.start, callback.start).appendLeft(callback.start, 'const renderPage = ')
    result.appendLeft(
      callback.end,
      `

if (import.meta.env.PROD) {
  createServer(renderPage`,
    )
    result.remove(lastArgument.end, statement.end).appendRight(
      lastArgument.end,
      `)
}

export default renderPage`,
    )

    return result
  }

  return null
}
