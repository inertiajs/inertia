import { ParsedCode } from './astUtils'
import { type FrameworkConfig, type SSROptions, formatSSROptions } from './types'

export function findInertiaAppExport(code: string): boolean {
  return !!ParsedCode.from(code)?.inertiaStatement
}

export function wrapWithServerBootstrap(
  code: string,
  options: SSROptions,
  frameworks: Record<string, FrameworkConfig>,
): string | null {
  const parsed = ParsedCode.from(code)

  if (!parsed?.inertiaStatement) {
    return null
  }

  const framework = parsed.detectFramework(frameworks)

  if (!framework?.config.ssr) {
    return null
  }

  const { statement, call } = parsed.inertiaStatement
  const configureCall = code.slice(call.start, call.end)
  const ssrCode = framework.config.ssr(configureCall, formatSSROptions(options)).trim()

  return code.slice(0, statement.start) + ssrCode + code.slice(statement.end)
}
