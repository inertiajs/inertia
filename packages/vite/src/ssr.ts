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
import { collectCSSFromModuleGraph } from './css'
import { classifySSRError, formatConsoleError } from './ssrErrors'

/** Options for the SSR dev server and production builds. */
export interface InertiaSSROptions {
  /**
   * Path to the SSR entry file. Auto-detected when not specified.
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

  /**
   * When enabled, SSR errors are formatted with hints instead of thrown raw.
   * Defaults to true.
   */
  handleErrors?: boolean

  /**
   * Enable sourcemaps for SSR builds so error stacks map to original files.
   * Defaults to true.
   */
  sourcemap?: boolean
}

export const SSR_ENDPOINT = '/__inertia_ssr'

export const SSR_ENTRY_CANDIDATES = [
  'resources/js/ssr.ts',
  'resources/js/ssr.tsx',
  'resources/js/ssr.js',
  'resources/js/ssr.jsx',
  'src/ssr.ts',
  'src/ssr.tsx',
  'src/ssr.js',
  'src/ssr.jsx',
  'resources/js/app.ts',
  'resources/js/app.tsx',
  'resources/js/app.js',
  'resources/js/app.jsx',
  'src/app.ts',
  'src/app.tsx',
  'src/app.js',
  'src/app.jsx',
]

export function resolveSSREntry(options: InertiaSSROptions, config: ResolvedConfig): string | null {
  if (options.entry) {
    if (existsSync(resolve(config.root, options.entry))) {
      return options.entry
    }

    config.logger.warn(`Inertia SSR entry not found: ${options.entry}`)

    return null
  }

  return SSR_ENTRY_CANDIDATES.find((path) => existsSync(resolve(config.root, path))) ?? null
}

export async function handleSSRRequest(
  server: ViteDevServer,
  entry: string,
  req: IncomingMessage,
  res: ServerResponse,
  handleErrors: boolean = true,
): Promise<void> {
  let component: string | undefined
  let url: string | undefined

  // We temporarily override console.warn to suppress Vue's verbose component
  // trace warnings during SSR, and show our own cleaner error output instead.
  const originalWarn = console.warn
  const suppressedWarnings: string[] = []

  console.warn = (...args: unknown[]) => {
    const message = args[0]?.toString() ?? ''

    if (message.includes('[Vue warn]') || message.includes('at <')) {
      if (handleErrors) {
        suppressedWarnings.push(args.map(String).join(' '))
      }

      return
    }

    originalWarn.apply(console, args)
  }

  try {
    const page = await readRequestBody<{ component: string; url: string }>(req)
    component = page.component
    url = page.url
    const start = performance.now()

    const render = await loadRenderFunction(server, entry)
    const result = await render(page)

    if (!result || typeof result.body !== 'string') {
      throw new Error(`SSR render must return { head: string[], body: string }`)
    }

    const cssLinks = collectCSSFromModuleGraph(server, entry)
    result.head = [...cssLinks, ...result.head]

    logSSRRequest(server, page.component, start)

    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(result))
  } catch (error) {
    handleSSRError(server, res, error as Error, component, url, handleErrors, suppressedWarnings)
  } finally {
    console.warn = originalWarn
  }
}

async function loadRenderFunction(
  server: ViteDevServer,
  entry: string,
): Promise<(page: unknown) => Promise<{ head: string[]; body: string }>> {
  const module = await server.ssrLoadModule(entry)
  const render = await Promise.resolve(module.default)

  if (typeof render !== 'function') {
    throw new Error(`SSR entry "${entry}" must export a render function`)
  }

  return render
}

function readRequestBody<T>(req: IncomingMessage): Promise<T> {
  return new Promise((resolve, reject) => {
    let data = ''

    req.on('data', (chunk) => (data += chunk))

    req.on('end', () => {
      if (!data.trim()) {
        reject(new Error('Request body is empty'))
        return
      }

      try {
        resolve(JSON.parse(data))
      } catch (error) {
        reject(new Error(`Invalid JSON in request body: ${error instanceof Error ? error.message : 'Unknown error'}`))
      }
    })

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

  server.config.logger.info(`\x1b[32m${timestamp}\x1b[0m SSR ${component} \x1b[90m${duration}ms\x1b[0m`)
}

function handleSSRError(
  server: ViteDevServer,
  res: ServerResponse,
  error: Error,
  component?: string,
  url?: string,
  handleErrors: boolean = true,
  suppressedWarnings: string[] = [],
): void {
  server.ssrFixStacktrace(error)

  if (!handleErrors) {
    throw error
  }

  const classified = classifySSRError(error, component, url)

  server.config.logger.error(formatConsoleError(classified, server.config.root, handleErrors, suppressedWarnings))

  res.setHeader('Content-Type', 'application/json')
  res.statusCode = 500
  res.end(JSON.stringify(classified))
}
