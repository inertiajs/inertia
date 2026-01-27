import type { Plugin } from 'vite'
import { pages, PagesOptions, transformPageResolution } from './pages'
import { handleSSRRequest, InertiaSSROptions, resolveSSREntry, SSR_ENDPOINT } from './ssr'

export { InertiaSSROptions, pages, PagesOptions }

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

    config(config) {
      if (!config.build?.ssr) {
        return
      }

      const ssrConfig = {
        ...(ssr.port !== undefined && { port: ssr.port }),
        ...(ssr.cluster !== undefined && { cluster: ssr.cluster }),
      }

      if (Object.keys(ssrConfig).length === 0) {
        return
      }

      return {
        define: {
          'import.meta.env.INERTIA_SSR_CONFIG': JSON.stringify(ssrConfig),
        },
      }
    },

    transform(code, id, options) {
      if (!/\.[jt]sx?$/.test(id)) {
        return null
      }

      let result = code

      if (options?.ssr && isDevMode && code.includes('INERTIA_SSR_DEV')) {
        result = result.replace(/import\.meta\.env\.INERTIA_SSR_DEV/g, 'true')
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
