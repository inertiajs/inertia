import type { FrameworkConfig } from '../types'

/**
 * Vue framework config
 *
 * This shows how the Vite plugin wraps your configureInertiaApp() call for SSR.
 * Use this as a reference to create your own config for custom frameworks.
 *
 * Manual SSR equivalent:
 *
 *   import { configureInertiaApp } from '@inertiajs/vue3'
 *   import createServer from '@inertiajs/vue3/server'
 *   import { renderToString } from 'vue/server-renderer'
 *
 *   const render = await configureInertiaApp({ ... })
 *
 *   createServer((page) => render(page, renderToString))
 */
export const config: FrameworkConfig = {
  package: '@inertiajs/vue3',
  extensions: ['.vue'],
  extractDefault: true,
  ssr: (configureCall, options) => `
import createServer from '@inertiajs/vue3/server'
import { renderToString } from 'vue/server-renderer'

const render = await ${configureCall}

createServer((page) => render(page, renderToString)${options})
`,
}
