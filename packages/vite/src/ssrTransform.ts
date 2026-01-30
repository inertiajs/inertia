import type { InertiaSSROptions } from './ssr'
import { ParsedCode } from './astUtils'

export function findInertiaAppExport(code: string): boolean {
  return !!ParsedCode.from(code)?.inertiaStatement
}

export function wrapWithServerBootstrap(code: string, options: InertiaSSROptions): string | null {
  const parsed = ParsedCode.from(code)

  if (!parsed?.inertiaStatement) {
    return null
  }

  const { statement, call } = parsed.inertiaStatement
  const callCode = code.slice(call.start, call.end)
  const renderer = parsed.serverRenderer
  const renderFn = parsed.serverRenderFn

  const lines = [
    `import __inertia_createServer__ from '@inertiajs/core/server'`,
    renderer && `import { ${renderFn} as __inertia_ssr_render__ } from '${renderer}'`,
    `const __inertia_app__ = await ${callCode}`,
    renderer
      ? `const __inertia_render__ = (page) => __inertia_app__(page, __inertia_ssr_render__)`
      : `const __inertia_render__ = __inertia_app__`,
    `__inertia_createServer__(__inertia_render__${formatOptions(options)})`,
    `export default __inertia_render__`,
  ]

  const replacement = lines.filter(Boolean).join('\n')

  return code.slice(0, statement.start) + replacement + code.slice(statement.end)
}

function formatOptions(options: InertiaSSROptions): string {
  const config: Record<string, unknown> = {}

  if (options.port !== undefined) {
    config.port = options.port
  }

  if (options.cluster !== undefined) {
    config.cluster = options.cluster
  }

  return Object.keys(config).length > 0 ? `, ${JSON.stringify(config)}` : ''
}
