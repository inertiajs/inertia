/**
 * Svelte Framework Configuration
 *
 * This file defines how the Vite plugin handles Svelte applications.
 * It serves as a reference for creating custom framework configurations.
 *
 * The SSR template shows what the plugin generates. For a user's SSR entry:
 *
 * ```js
 * import { createInertiaApp } from '@inertiajs/svelte'
 *
 * createInertiaApp({
 *   resolve: (name) => resolvePageComponent(name),
 * })
 * ```
 *
 * The plugin transforms it to:
 *
 * ```js
 * import { createInertiaApp } from '@inertiajs/svelte'
 * import createServer from '@inertiajs/svelte/server'
 * import { render } from 'svelte/server'
 *
 * const ssr = await createInertiaApp({
 *   resolve: (name) => resolvePageComponent(name),
 * })
 *
 * const renderPage = (page) => ssr(page, render)
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
  // Package name used to detect Svelte usage via import statements
  package: '@inertiajs/svelte',

  // Svelte components use .svelte extension
  extensions: ['.svelte'],

  // Svelte components ARE the module - no .default extraction needed
  // This is different from Vue/React where components use `export default`
  extractDefault: false,

  // SSR template that wraps the createInertiaApp call with server bootstrap code
  // Uses import.meta.env.PROD to skip the standalone server in dev mode
  // Note: Svelte uses a different variable name (ssr) and render function import
  ssr: (configureCall, options) => `
import createServer from '@inertiajs/svelte/server'
import { render } from 'svelte/server'

const ssr = await ${configureCall}

const renderPage = (page) => ssr(page, render)

if (import.meta.env.PROD) {
  createServer(renderPage${options})
}

export default renderPage
`,
}
