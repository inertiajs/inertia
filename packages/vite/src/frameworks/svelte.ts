/**
 * Svelte Framework Configuration
 *
 * This file defines how the Vite plugin handles Svelte applications.
 * It serves as a reference for creating custom framework configurations.
 *
 * The SSR template shows what the plugin generates. For a user's SSR entry:
 *
 * ```js
 * import { configureInertiaApp } from '@inertiajs/svelte'
 *
 * configureInertiaApp({
 *   resolve: (name) => resolvePageComponent(name),
 * })
 * ```
 *
 * The plugin transforms it to:
 *
 * ```js
 * import { configureInertiaApp } from '@inertiajs/svelte'
 * import createServer from '@inertiajs/svelte/server'
 * import { render } from 'svelte/server'
 *
 * const ssr = await configureInertiaApp({
 *   resolve: (name) => resolvePageComponent(name),
 * })
 *
 * createServer((page) => ssr(page, render))
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

  // SSR template that wraps the configureInertiaApp call with server bootstrap code
  // Note: Svelte uses a different variable name (ssr) and render function import
  ssr: (configureCall, options) => `
import createServer from '@inertiajs/svelte/server'
import { render } from 'svelte/server'

const ssr = await ${configureCall}

createServer((page) => ssr(page, render)${options})
`,
}
