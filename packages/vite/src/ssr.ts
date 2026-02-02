/**
 * SSR Dev Server
 *
 * This module handles SSR rendering during development. Instead of running
 * a separate Node.js SSR server, the Vite dev server exposes an HTTP endpoint
 * that Laravel can call to render pages server-side.
 *
 * How it works:
 * 1. Laravel detects that the Vite dev server is running
 * 2. Laravel POSTs the page data to `/__inertia_ssr`
 * 3. This module loads the SSR entry file via Vite's SSR module loader
 * 4. The entry file's default export is called with the page data
 * 5. The rendered HTML is returned to Laravel
 *
 * This approach provides:
 * - Hot Module Replacement (HMR) for SSR code during development
 * - No need to restart a separate SSR server when code changes
 * - Automatic TypeScript/JSX transformation via Vite
 */

import { existsSync } from 'node:fs'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { resolve } from 'node:path'
import type { ResolvedConfig, ViteDevServer } from 'vite'

/**
 * SSR configuration options for the Vite plugin.
 */
export interface InertiaSSROptions {
  /**
   * Path to the SSR entry file.
   * If not specified, the plugin will auto-detect from common locations.
   */
  entry?: string

  /**
   * Port number for the SSR server (used in production builds).
   */
  port?: number

  /**
   * Enable cluster mode for the SSR server (used in production builds).
   */
  cluster?: boolean
}

/**
 * The HTTP endpoint path where Laravel sends SSR render requests.
 */
export const SSR_ENDPOINT = '/__inertia_ssr'

/**
 * Common locations where the SSR entry file might be found.
 * The plugin checks these in order and uses the first one that exists.
 *
 * Priority:
 * 1. Dedicated SSR files (ssr.ts/tsx/js/jsx) - Laravel structure then src structure
 * 2. App entry files (app.ts/tsx/js/jsx) - fallback if no dedicated SSR file
 */
const SSR_ENTRY_CANDIDATES = [
  // Laravel structure - dedicated SSR file
  'resources/js/ssr.ts',
  'resources/js/ssr.tsx',
  'resources/js/ssr.js',
  'resources/js/ssr.jsx',
  // Generic src structure - dedicated SSR file
  'src/ssr.ts',
  'src/ssr.tsx',
  'src/ssr.js',
  'src/ssr.jsx',
  // Laravel structure - app file (can serve as SSR entry with transform)
  'resources/js/app.ts',
  'resources/js/app.tsx',
  'resources/js/app.js',
  'resources/js/app.jsx',
  // Generic src structure - app file
  'src/app.ts',
  'src/app.tsx',
  'src/app.js',
  'src/app.jsx',
]

/**
 * Resolve the SSR entry file path.
 *
 * If an explicit entry is configured, validates that it exists.
 * Otherwise, auto-detects from common locations.
 *
 * @returns The entry path, or null if SSR should be disabled
 */
export function resolveSSREntry(options: InertiaSSROptions, config: ResolvedConfig): string | null {
  // Explicit entry configured - validate it exists
  if (options.entry) {
    if (existsSync(resolve(config.root, options.entry))) {
      return options.entry
    }

    config.logger.warn(`Inertia SSR entry not found: ${options.entry}`)

    return null
  }

  // Auto-detect from common locations
  return SSR_ENTRY_CANDIDATES.find((path) => existsSync(resolve(config.root, path))) ?? null
}

/**
 * Handle an incoming SSR render request from Laravel.
 *
 * This is the main entry point for SSR during development.
 * Laravel POSTs the Inertia page data, and we return the rendered HTML.
 */
export async function handleSSRRequest(
  server: ViteDevServer,
  entry: string,
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  try {
    // Parse the page data from the request body
    const page = await readRequestBody<{ component: string }>(req)
    const start = performance.now()

    // Load and execute the SSR entry module
    const render = await loadRenderFunction(server, entry)
    const result = await render(page)

    // Validate the render result
    if (!result || typeof result.body !== 'string') {
      throw new Error(`SSR render must return { head: string[], body: string }`)
    }

    // Log the request for debugging
    logSSRRequest(server, page.component, start)

    // Return the rendered result to Laravel
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(result))
  } catch (error) {
    handleSSRError(server, res, error as Error)
  }
}

/**
 * Load the render function from the SSR entry module.
 *
 * Uses Vite's `ssrLoadModule` to load the entry file with full
 * HMR support and source map handling.
 *
 * The entry module should export a render function as its default export:
 * ```js
 * export default (page) => render(page, renderToString)
 * ```
 */
async function loadRenderFunction(
  server: ViteDevServer,
  entry: string,
): Promise<(page: unknown) => Promise<{ head: string[]; body: string }>> {
  // Load the module through Vite (applies transforms, handles HMR)
  const module = await server.ssrLoadModule(entry)

  // The default export might be a promise (from async module), so we await it
  const render = await Promise.resolve(module.default)

  if (typeof render !== 'function') {
    throw new Error(`SSR entry "${entry}" must export a render function`)
  }

  return render
}

/**
 * Read and parse the JSON request body from an HTTP request.
 */
function readRequestBody<T>(req: IncomingMessage): Promise<T> {
  return new Promise((resolve, reject) => {
    let data = ''

    req.on('data', (chunk) => (data += chunk))
    req.on('end', () => resolve(JSON.parse(data)))
    req.on('error', reject)
  })
}

/**
 * Log an SSR request to the Vite dev server console.
 *
 * Output format: `2024-01-15 10:30:45 SSR Users/Index 12.34ms`
 */
function logSSRRequest(server: ViteDevServer, component: string, start: number): void {
  const duration = (performance.now() - start).toFixed(2)
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19)

  // ANSI color codes: green for timestamp, gray for duration
  server.config.logger.info(`\x1b[32m${timestamp}\x1b[0m SSR ${component} \x1b[90m${duration}ms\x1b[0m`)
}

/**
 * Handle an error that occurred during SSR rendering.
 *
 * Logs the error with a fixed stack trace (Vite maps source locations)
 * and returns a 500 response with error details.
 */
function handleSSRError(server: ViteDevServer, res: ServerResponse, error: Error): void {
  // Fix the stack trace to show original source locations
  server.ssrFixStacktrace(error)

  server.config.logger.error(`Inertia SSR: ${error.message}`)

  if (error.stack) {
    server.config.logger.error(error.stack)
  }

  // Return error details to Laravel for debugging
  res.setHeader('Content-Type', 'application/json')
  res.statusCode = 500
  res.end(JSON.stringify({ error: error.message, stack: error.stack }))
}
