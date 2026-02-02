import type { FrameworkConfig } from '../types'

/**
 * React framework config
 *
 * This shows how the Vite plugin wraps your configureInertiaApp() call for SSR.
 * Use this as a reference to create your own config for custom frameworks.
 *
 * Manual SSR equivalent:
 *
 *   import { configureInertiaApp } from '@inertiajs/react'
 *   import createServer from '@inertiajs/react/server'
 *   import { renderToString } from 'react-dom/server'
 *
 *   const render = await configureInertiaApp({ ... })
 *
 *   createServer((page) => render(page, renderToString))
 */
export const config: FrameworkConfig = {
  package: '@inertiajs/react',
  extensions: ['.tsx', '.jsx'],
  extractDefault: true,
  ssr: (configureCall, options) => `
import createServer from '@inertiajs/react/server'
import { renderToString } from 'react-dom/server'

const render = await ${configureCall}

createServer((page) => render(page, renderToString)${options})
`,
}
