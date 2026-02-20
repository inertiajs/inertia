/**
 * Inertia.js Vite Plugin
 *
 * This plugin provides two main features:
 *
 * 1. **Pages shorthand** - Transforms `pages: './Pages'` into a full `resolve` function
 *    that uses `import.meta.glob` to load page components. This saves users from writing
 *    boilerplate glob code in every project.
 *
 * 2. **SSR dev server** - During development, wraps the SSR entry file with server bootstrap
 *    code and exposes an HTTP endpoint that Laravel can call to render pages server-side.
 *    This eliminates the need to run a separate Node.js SSR server during development.
 *
 * The plugin is framework-agnostic - it detects which Inertia adapter (Vue, React, Svelte)
 * is being used by looking at import statements, then applies the appropriate transforms.
 * Custom frameworks can be added via the `frameworks` option.
 */

import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import type { Plugin } from 'vite'
import { defaultFrameworks } from './frameworks/index'
import { transformPageResolution } from './pagesTransform'
import { handleSSRRequest, InertiaSSROptions, resolveSSREntry, SSR_ENDPOINT, SSR_ENTRY_CANDIDATES } from './ssr'
import { findInertiaAppExport, wrapWithServerBootstrap } from './ssrTransform'
import type { FrameworkConfig } from './types'

export type { FrameworkConfig, SSRTemplate } from './types'
export { InertiaSSROptions }

export interface InertiaPluginOptions {
  /**
   * SSR configuration. Pass a string for the entry path, or an object
   * for additional options. Auto-detected when not specified from:
   * - resources/js/ssr.{ts,tsx,js,jsx}
   * - src/ssr.{ts,tsx,js,jsx}
   * - resources/js/app.{ts,tsx,js,jsx}
   * - src/app.{ts,tsx,js,jsx}
   */
  ssr?: string | InertiaSSROptions

  /**
   * Custom framework configurations. Use this to add support for frameworks
   * beyond the built-in Vue, React, and Svelte adapters.
   *
   * @example
   * ```ts
   * inertia({
   *   frameworks: {
   *     package: '@inertiajs/solid',
   *     extensions: ['.tsx', '.jsx'],
   *     extractDefault: true,
   *     ssr: (configureCall, options) => `
   *       import createServer from '@inertiajs/solid/server'
   *       const render = await ${configureCall}
   *       createServer((page) => render(page)${options})
   *     `,
   *   }
   * })
   * ```
   */
  frameworks?: FrameworkConfig | FrameworkConfig[]
}

/**
 * Normalize the frameworks option into a record keyed by package name.
 */
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

    config(config, { isSsrBuild }) {
      if (!isSsrBuild) {
        return
      }

      const root = config.root ?? process.cwd()
      const ssrEntry = ssr.entry ?? SSR_ENTRY_CANDIDATES.find((candidate) => existsSync(resolve(root, candidate)))

      return {
        build: {
          sourcemap: ssr.sourcemap !== false ? (config.build?.sourcemap ?? true) : undefined,
          rollupOptions: ssrEntry
            ? {
                input: config.build?.rollupOptions?.input ?? ssrEntry,
              }
            : undefined,
        },
      }
    },

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
        result =
          wrapWithServerBootstrap(
            result,
            { port: ssr.port, cluster: ssr.cluster, handleErrors: ssr.handleErrors },
            frameworks,
          ) ?? result
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

        await handleSSRRequest(server, entry!, req, res, ssr.handleErrors ?? true)
      })

      server.config.logger.info(`Inertia SSR dev endpoint: ${SSR_ENDPOINT}`)
    },
  }
}
