import type { InertiaSSROptions } from './ssr'
import { ParsedCode } from './astUtils'

export function findInertiaAppExport(code: string): boolean {
  return !!ParsedCode.from(code)?.findInertiaCall()
}

export function wrapWithServerBootstrap(code: string, options: InertiaSSROptions): string | null {
  const parsed = ParsedCode.from(code)
  const match = parsed?.findInertiaCall()

  if (!match) {
    return null
  }

  const callCode = code.slice(match.callNode.start, match.callNode.end)
  const configArg = buildConfigArg(options)
  const rendererModule = parsed!.serverRenderer

  const rendererImport = rendererModule
    ? `import { renderToString as __inertia_renderToString__ } from '${rendererModule}'\n`
    : ''

  const renderWrapper = rendererModule
    ? `const __inertia_render__ = (page) => __inertia_app__(page, __inertia_renderToString__)`
    : `const __inertia_render__ = __inertia_app__`

  const replacement = `import __inertia_createServer__ from '@inertiajs/core/server'
${rendererImport}const __inertia_app__ = await ${callCode}
${renderWrapper}
__inertia_createServer__(__inertia_render__${configArg})
export default __inertia_render__`

  return code.slice(0, match.statementNode.start) + replacement + code.slice(match.statementNode.end)
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
