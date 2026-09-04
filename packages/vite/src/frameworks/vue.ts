/**
 * Vue Framework Configuration
 *
 * This file defines how the Vite plugin handles Vue applications.
 * It serves as a reference for creating custom framework configurations.
 *
 * The SSR template shows what the plugin generates. For a user's SSR entry:
 *
 * ```js
 * import { createInertiaApp } from '@inertiajs/vue3'
 *
 * createInertiaApp({
 *   resolve: (name) => resolvePageComponent(name),
 * })
 * ```
 *
 * The plugin transforms it to:
 *
 * ```js
 * import { createInertiaApp } from '@inertiajs/vue3'
 * import createServer from '@inertiajs/vue3/server'
 * import { renderToString } from 'vue/server-renderer'
 *
 * const renderPromise = createInertiaApp({
 *   resolve: (name) => resolvePageComponent(name),
 * })
 *
 * renderPromise.catch(() => {})
 *
 * const renderPage = async (page) => (await renderPromise)(page, renderToString)
 *
 * // Only start server in production
 * if (import.meta.env.PROD) {
 *   createServer(renderPage)
 * }
 *
 * export default renderPage
 * ```
 */

import type { FrameworkConfig } from '../types'

export const config: FrameworkConfig = {
  // Package name used to detect Vue usage via import statements
  package: '@inertiajs/vue3',

  // Vue single-file components use .vue extension
  extensions: ['.vue'],

  // Vue components are exported as `export default`, so we need to extract .default
  extractDefault: true,

  // SSR template that wraps the createInertiaApp call with server bootstrap code
  // Uses import.meta.env.PROD to skip the standalone server in dev mode
  // Awaited per render, not at the top level, so the bundle can compile to CommonJS
  ssr: (configureCall, options) => `
import createServer from '@inertiajs/vue3/server'
import { renderToString } from 'vue/server-renderer'

const renderPromise = ${configureCall}

// Reported per render by the SSR server, so it must not go unhandled here
renderPromise.catch(() => {})

const renderPage = async (page) => (await renderPromise)(page, renderToString)

if (import.meta.env.PROD) {
  createServer(renderPage${options})
}

export default renderPage
`,
}
