import { existsSync } from 'node:fs'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { resolve } from 'node:path'
import type { ResolvedConfig, ViteDevServer } from 'vite'

export interface InertiaSSROptions {
  entry?: string
  port?: number
  cluster?: boolean
}

export const SSR_ENDPOINT = '/__inertia_ssr'

const ssrEntryCandidates = [
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

  return ssrEntryCandidates.find((path) => existsSync(resolve(config.root, path))) ?? null
}

export async function handleSSRRequest(
  server: ViteDevServer,
  entry: string,
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  try {
    const page = await readJson<{ component: string }>(req)
    const start = performance.now()

    const render = await loadRenderFunction(server, entry)
    const result = await render(page)

    if (!result || typeof result.body !== 'string') {
      throw new Error(`SSR render must return { head: string[], body: string }. Got: ${JSON.stringify(result)}`)
    }

    const duration = (performance.now() - start).toFixed(2)
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19)

    server.config.logger.info(`\x1b[32m${timestamp}\x1b[0m SSR ${page.component} \x1b[90m${duration}ms\x1b[0m`)

    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(result))
  } catch (error) {
    server.ssrFixStacktrace(error as Error)
    server.config.logger.error(`Inertia SSR Error: ${(error as Error).message}`)

    if ((error as Error).stack) {
      server.config.logger.error((error as Error).stack!)
    }

    res.setHeader('Content-Type', 'application/json')
    res.statusCode = 500
    res.end(JSON.stringify({ error: (error as Error).message, stack: (error as Error).stack }))
  }
}

async function loadRenderFunction(
  server: ViteDevServer,
  entry: string,
): Promise<(page: unknown) => Promise<{ head: string[]; body: string }>> {
  const module = await server.ssrLoadModule(entry)
  const render = await Promise.resolve(module.default)

  if (typeof render !== 'function') {
    throw new Error(`SSR entry "${entry}" must export a default render function. Got: ${typeof render}`)
  }

  return render
}

function readJson<T>(req: IncomingMessage): Promise<T> {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (chunk) => (data += chunk))
    req.on('end', () => resolve(JSON.parse(data)))
    req.on('error', reject)
  })
}
