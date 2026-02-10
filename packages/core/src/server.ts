import { originalPositionFor, TraceMap } from '@jridgewell/trace-mapping'
import { createServer, IncomingMessage, ServerResponse } from 'http'
import cluster from 'node:cluster'
import { existsSync, readFileSync } from 'node:fs'
import { availableParallelism } from 'node:os'
import path from 'node:path'
import * as process from 'process'
import { classifySSRError, formatConsoleError, setSourceMapResolver } from './ssrErrors'
import { InertiaAppResponse, Page } from './types'

// Re-export SSR error utilities for use by @inertiajs/vite
export { BROWSER_APIS, type ClassifiedSSRError, type SSRErrorType } from './ssrErrors'

// Cache parsed sourcemaps for performance
const sourceMaps = new Map<string, TraceMap>()

setSourceMapResolver((file: string, line: number, column: number) => {
  // Only resolve for bundled SSR files
  if (!file.includes('/ssr/') || !file.endsWith('.js')) {
    return null
  }

  const mapFile = file + '.map'

  if (!existsSync(mapFile)) {
    return null
  }

  let traceMap = sourceMaps.get(mapFile)

  if (!traceMap) {
    try {
      const mapContent = readFileSync(mapFile, 'utf-8')
      traceMap = new TraceMap(mapContent)
      sourceMaps.set(mapFile, traceMap)
    } catch {
      return null
    }
  }

  const original = originalPositionFor(traceMap, { line, column })

  if (original.source) {
    // Resolve the source path relative to the sourcemap location
    const mapDir = path.dirname(mapFile)
    const resolvedPath = path.resolve(mapDir, original.source)

    return {
      file: resolvedPath,
      line: original.line ?? line,
      column: original.column ?? column,
    }
  }

  return null
})

type AppCallback = (page: Page) => InertiaAppResponse
type RouteHandler = (request: IncomingMessage, response: ServerResponse) => Promise<unknown>
type ServerOptions = {
  port?: number
  cluster?: boolean
  handleErrors?: boolean
}
type Port = number

const readableToString: (readable: IncomingMessage) => Promise<string> = (readable) =>
  new Promise((resolve, reject) => {
    let data = ''
    readable.on('data', (chunk) => (data += chunk))
    readable.on('end', () => resolve(data))
    readable.on('error', (err) => reject(err))
  })

export default (render: AppCallback, options?: Port | ServerOptions): AppCallback => {
  const opts = typeof options === 'number' ? { port: options } : options
  const { port = 13714, cluster: useCluster = false, handleErrors = true } = opts ?? {}

  const log = (message: string) => {
    console.log(
      useCluster && !cluster.isPrimary
        ? `[${cluster.worker?.id ?? 'N/A'} / ${cluster.worker?.process?.pid ?? 'N/A'}] ${message}`
        : message,
    )
  }

  if (useCluster && cluster.isPrimary) {
    log('Primary Inertia SSR server process started...')

    for (let i = 0; i < availableParallelism(); i++) {
      cluster.fork()
    }

    return render
  }

  const handleRender = async (request: IncomingMessage, response: ServerResponse) => {
    const page: Page = JSON.parse(await readableToString(request))

    // Suppress framework warnings during render (they clutter the output)
    const originalWarn = console.warn

    if (handleErrors) {
      console.warn = () => {}
    }

    try {
      const result = await render(page)

      response.writeHead(200, { 'Content-Type': 'application/json', Server: 'Inertia.js SSR' })
      response.write(JSON.stringify(result))
    } catch (e) {
      const error = e as Error

      if (!handleErrors) {
        throw error
      }

      const classified = classifySSRError(error, page.component, page.url)
      console.error(formatConsoleError(classified))

      response.writeHead(500, { 'Content-Type': 'application/json', Server: 'Inertia.js SSR' })
      response.write(JSON.stringify(classified))
    } finally {
      console.warn = originalWarn
    }
  }

  const routes: Record<string, RouteHandler> = {
    '/health': async () => ({ status: 'OK', timestamp: Date.now() }),
    '/shutdown': () => process.exit(),
    '/render': handleRender,
    '/404': async () => ({ status: 'NOT_FOUND', timestamp: Date.now() }),
  }

  createServer(async (request, response) => {
    const dispatchRoute = routes[request.url as string] ?? routes['/404']
    const result = await dispatchRoute(request, response)

    if (!response.headersSent) {
      response.writeHead(200, { 'Content-Type': 'application/json', Server: 'Inertia.js SSR' })
      response.write(JSON.stringify(result))
    }

    response.end()
  }).listen(port, () => log('Inertia SSR server started.'))

  log(`Starting SSR server on port ${port}...`)

  // Return the render callback so it can be exported for Vite SSR dev mode
  return render
}
