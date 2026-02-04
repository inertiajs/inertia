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
import { transformPageResolution } from './pagesTransform'
import { defaultFrameworks } from './frameworks/index'
import { handleSSRRequest, InertiaSSROptions, resolveSSREntry, SSR_ENDPOINT, SSR_ENTRY_CANDIDATES } from './ssr'
import { findInertiaAppExport, wrapWithServerBootstrap } from './ssrTransform'
import type { FrameworkConfig } from './types'

export { InertiaSSROptions }
export type { SSRTemplate, FrameworkConfig } from './types'

export interface InertiaPluginOptions {
  /**
   * SSR configuration. Can be a string path to the SSR entry file,
   * or an object with additional options like port and cluster mode.
   *
   * If not specified, the plugin will auto-detect common entry locations:
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
 * Convert the flexible `frameworks` option (single config or array) into a
 * lookup record keyed by package name for efficient framework detection.
 */
function toFrameworkRecord(input?: FrameworkConfig | FrameworkConfig[]): Record<string, FrameworkConfig> {
  if (!input) {
    return {}
  }

  const configs = Array.isArray(input) ? input : [input]

  return Object.fromEntries(configs.map((config) => [config.package, config]))
}

export default function inertia(options: InertiaPluginOptions = {}): Plugin {
  // Normalize SSR options - accept either a string path or full options object
  const ssr = typeof options.ssr === 'string' ? { entry: options.ssr } : (options.ssr ?? {})

  // Merge custom frameworks with defaults (custom frameworks override defaults with same package name)
  const frameworks = { ...defaultFrameworks, ...toFrameworkRecord(options.frameworks) }

  // Will be set in configResolved once we know the project root
  let entry: string | null = null

  return {
    name: '@inertiajs/vite',

    /**
     * Modify Vite config before it's resolved.
     * For SSR builds: auto-detects entry file and enables sourcemaps by default.
     */
    config(config, { isSsrBuild }) {
      if (!isSsrBuild) {
        return
      }

      const root = config.root ?? process.cwd()
      const ssrEntry =
        ssr.entry ?? SSR_ENTRY_CANDIDATES.find((candidate) => existsSync(resolve(root, candidate)))

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

    /**
     * After Vite resolves its config, we can determine the SSR entry file.
     * This runs before any transforms, so we know early if SSR is enabled.
     */
    configResolved(config) {
      entry = resolveSSREntry(ssr, config)

      if (entry && config.build?.ssr) {
        config.logger.info(`Inertia SSR entry: ${entry}`)
      }
    },

    /**
     * Transform hook - runs on every JS/TS file during both dev and build.
     *
     * For SSR builds: Wraps the Inertia app configuration with server bootstrap code.
     * For all builds: Transforms the `pages` shorthand into a full `resolve` function.
     */
    transform(code, id, options) {
      // Only process JavaScript/TypeScript files
      if (!/\.[jt]sx?$/.test(id)) {
        return null
      }

      let result = code

      // SSR transform: wrap createInertiaApp() with server bootstrap code
      // This only applies during SSR builds (options.ssr is true)
      if (options?.ssr && findInertiaAppExport(result)) {
        result = wrapWithServerBootstrap(result, { port: ssr.port, cluster: ssr.cluster, debug: ssr.debug }, frameworks) ?? result
      }

      // Pages transform: convert `pages: './Pages'` to a full resolve function
      // This applies to both client and SSR builds
      return transformPageResolution(result, frameworks) ?? (result !== code ? result : null)
    },

    /**
     * Dev server middleware - exposes an HTTP endpoint for SSR rendering.
     *
     * During development, Laravel calls this endpoint instead of spawning a
     * separate Node.js process. The endpoint loads the SSR entry module via
     * Vite's SSR module loader (with full HMR support) and renders the page.
     */
    configureServer(server) {
      if (!entry) {
        return
      }

      server.middlewares.use(SSR_ENDPOINT, async (req, res, next) => {
        if (req.method !== 'POST') {
          return next()
        }

        await handleSSRRequest(server, entry!, req, res, ssr.debug ?? false)
      })

      server.config.logger.info(`Inertia SSR dev endpoint: ${SSR_ENDPOINT}`)
    },
  }
}
