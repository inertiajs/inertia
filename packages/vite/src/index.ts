import type { Plugin } from 'vite'
import { transformPageResolution } from './pagesTransform'
import { handleSSRRequest, InertiaSSROptions, resolveSSREntry, SSR_ENDPOINT } from './ssr'
import { findInertiaAppExport, wrapWithServerBootstrap } from './ssrTransform'

export { InertiaSSROptions }

export interface InertiaPluginOptions {
  ssr?: string | InertiaSSROptions
}

export default function inertia(options: InertiaPluginOptions = {}): Plugin {
  const ssr = typeof options.ssr === 'string' ? { entry: options.ssr } : (options.ssr ?? {})

  let entry: string | null = null
  let isDevMode = false

  return {
    name: '@inertiajs/vite',

    configResolved(config) {
      entry = resolveSSREntry(ssr, config)
      isDevMode = config.command === 'serve'

      if (entry && config.build?.ssr) {
        config.logger.info(`Inertia SSR entry: ${entry}`)
      }
    },

    transform(code, id, options) {
      if (!/\.[jt]sx?$/.test(id)) {
        return null
      }

      let result = code

      if (options?.ssr && !isDevMode && findInertiaAppExport(result)) {
        result = wrapWithServerBootstrap(result, ssr) ?? result
      }

      return transformPageResolution(result) ?? (result !== code ? result : null)
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
