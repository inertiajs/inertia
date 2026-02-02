/**
 * Vue Framework Configuration
 *
 * This file defines how the Vite plugin handles Vue applications.
 * It serves as a reference for creating custom framework configurations.
 *
 * The SSR template shows what the plugin generates. For a user's SSR entry:
 *
 * ```js
 * import { configureInertiaApp } from '@inertiajs/vue3'
 *
 * configureInertiaApp({
 *   resolve: (name) => resolvePageComponent(name),
 * })
 * ```
 *
 * The plugin transforms it to:
 *
 * ```js
 * import { configureInertiaApp } from '@inertiajs/vue3'
 * import createServer from '@inertiajs/vue3/server'
 * import { renderToString } from 'vue/server-renderer'
 *
 * const render = await configureInertiaApp({
 *   resolve: (name) => resolvePageComponent(name),
 * })
 *
 * const renderPage = (page) => render(page, renderToString)
 *
 * // Only start server in production (import.meta.hot is only available in Vite dev)
 * if (!import.meta.hot) {
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

  // SSR template that wraps the configureInertiaApp call with server bootstrap code
  // Uses import.meta.hot to detect dev mode at runtime (only available in Vite dev server)
  ssr: (configureCall, options) => `
import createServer from '@inertiajs/vue3/server'
import { renderToString } from 'vue/server-renderer'

const render = await ${configureCall}

const renderPage = (page) => render(page, renderToString)

if (!import.meta.hot) {
  createServer(renderPage${options})
}

export default renderPage
`,
}
