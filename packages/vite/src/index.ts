import type { Plugin } from 'vite'
import { transformPageResolution } from './pagesTransform'
import { defaultFrameworks } from './frameworks/index'
import { handleSSRRequest, InertiaSSROptions, resolveSSREntry, SSR_ENDPOINT } from './ssr'
import { findInertiaAppExport, wrapWithServerBootstrap } from './ssrTransform'
import type { FrameworkConfig } from './types'

export { InertiaSSROptions }
export type { SSRTemplate, FrameworkConfig } from './types'

export interface InertiaPluginOptions {
  ssr?: string | InertiaSSROptions
  frameworks?: FrameworkConfig | FrameworkConfig[]
}

function toFrameworkRecord(input?: FrameworkConfig | FrameworkConfig[]): Record<string, FrameworkConfig> {
  if (!input) {
    return {}
  }

  const configs = Array.isArray(input) ? input : [input]

  return Object.fromEntries(configs.map((config) => [config.package, config]))
}

export default function inertia(options: InertiaPluginOptions = {}): Plugin {
  const ssr = typeof options.ssr === 'string' ? { entry: options.ssr } : (options.ssr ?? {})
  const frameworks = { ...defaultFrameworks, ...toFrameworkRecord(options.frameworks) }

  let entry: string | null = null

  return {
    name: '@inertiajs/vite',

    configResolved(config) {
      entry = resolveSSREntry(ssr, config)

      if (entry && config.build?.ssr) {
        config.logger.info(`Inertia SSR entry: ${entry}`)
      }
    },

    transform(code, id, options) {
      if (!/\.[jt]sx?$/.test(id)) {
        return null
      }

      let result = code

      if (options?.ssr && findInertiaAppExport(result)) {
        result = wrapWithServerBootstrap(result, { port: ssr.port, cluster: ssr.cluster }, frameworks) ?? result
      }

      return transformPageResolution(result, frameworks) ?? (result !== code ? result : null)
    },

    configureServer(server) {
      if (!entry) {
        return
      }

      server.middlewares.use(SSR_ENDPOINT, async (req, res, next) => {
        if (req.method !== 'POST') {
          return next()
        }

        await handleSSRRequest(server, entry!, req, res)
      })

      server.config.logger.info(`Inertia SSR dev endpoint: ${SSR_ENDPOINT}`)
    },
  }
}
