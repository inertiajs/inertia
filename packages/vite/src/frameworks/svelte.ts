import type { FrameworkConfig } from '../types'

/**
 * Svelte framework config
 *
 * This shows how the Vite plugin wraps your configureInertiaApp() call for SSR.
 * Use this as a reference to create your own config for custom frameworks.
 *
 * Manual SSR equivalent:
 *
 *   import { configureInertiaApp } from '@inertiajs/svelte'
 *   import createServer from '@inertiajs/svelte/server'
 *   import { render } from 'svelte/server'
 *
 *   const ssr = await configureInertiaApp({ ... })
 *
 *   createServer((page) => ssr(page, render))
 */
export const config: FrameworkConfig = {
  package: '@inertiajs/svelte',
  extensions: ['.svelte'],
  extractDefault: false,
  ssr: (configureCall, options) => `
import createServer from '@inertiajs/svelte/server'
import { render } from 'svelte/server'

const ssr = await ${configureCall}

createServer((page) => ssr(page, render)${options})
`,
}
