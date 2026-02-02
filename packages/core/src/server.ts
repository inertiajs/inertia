import { createServer, IncomingMessage, ServerResponse } from 'http'
import cluster from 'node:cluster'
import { availableParallelism } from 'node:os'
import { spawnSync } from 'node:child_process'
import * as process from 'process'
import { classifySSRError, formatConsoleError } from './ssrErrors'
import { InertiaAppResponse, Page } from './types'

// Re-launch with --enable-source-maps if not already enabled
// This ensures error stack traces show original source file locations
if (!process.execArgv.includes('--enable-source-maps')) {
  const result = spawnSync(process.execPath, ['--enable-source-maps', ...process.argv.slice(1)], {
    stdio: 'inherit',
  })

  process.exit(result.status ?? 0)
}

type AppCallback = (page: Page) => InertiaAppResponse
type RouteHandler = (request: IncomingMessage, response: ServerResponse) => Promise<unknown>
type ServerOptions = {
  port?: number
  cluster?: boolean
  debug?: boolean
}
type Port = number

const readableToString: (readable: IncomingMessage) => Promise<string> = (readable) =>
  new Promise((resolve, reject) => {
    let data = ''
    readable.on('data', (chunk) => (data += chunk))
    readable.on('end', () => resolve(data))
    readable.on('error', (err) => reject(err))
  })

export default (render: AppCallback, options?: Port | ServerOptions): void => {
  const _port = typeof options === 'number' ? options : (options?.port ?? 13714)
  const _useCluster = typeof options === 'object' && options?.cluster !== undefined ? options.cluster : false
  const _debug = typeof options === 'object' && options?.debug !== undefined ? options.debug : false

  const log = (message: string) => {
    console.log(
      _useCluster && !cluster.isPrimary
        ? `[${cluster.worker?.id ?? 'N/A'} / ${cluster.worker?.process?.pid ?? 'N/A'}] ${message}`
        : message,
    )
  }

  if (_useCluster && cluster.isPrimary) {
    log('Primary Inertia SSR server process started...')

    for (let i = 0; i < availableParallelism(); i++) {
      cluster.fork()
    }

    return
  }

  const handleRender = async (request: IncomingMessage, response: ServerResponse) => {
    const page: Page = JSON.parse(await readableToString(request))

    // Suppress framework warnings during render when debug mode is enabled
    // These are typically verbose Vue/React warnings that clutter the output
    const originalWarn = console.warn
    if (_debug) {
      console.warn = () => {}
    }

    try {
      const result = await render(page)

      response.writeHead(200, { 'Content-Type': 'application/json', Server: 'Inertia.js SSR' })
      response.write(JSON.stringify(result))
    } catch (e) {
      const error = e as Error
      const classified = classifySSRError(error, page.component, page.url)

      if (_debug) {
        console.error(formatConsoleError(classified))
      } else {
        console.error(`SSR Error [${page.component}]: ${error.message}`)
      }

      response.writeHead(500, { 'Content-Type': 'application/json', Server: 'Inertia.js SSR' })
      response.write(JSON.stringify(classified))
    } finally {
      console.warn = originalWarn
    }
  }

  const routes: Record<string, RouteHandler> = {
    '/health': async (_request, response) => {
      response.writeHead(200, { 'Content-Type': 'application/json', Server: 'Inertia.js SSR' })
      response.write(JSON.stringify({ status: 'OK', timestamp: Date.now() }))
    },
    '/shutdown': () => process.exit(),
    '/render': handleRender,
  }

  createServer(async (request, response) => {
    const dispatchRoute = routes[<string>request.url]

    if (dispatchRoute) {
      await dispatchRoute(request, response)
    } else {
      response.writeHead(404, { 'Content-Type': 'application/json', Server: 'Inertia.js SSR' })
      response.write(JSON.stringify({ status: 'NOT_FOUND', timestamp: Date.now() }))
    }

    response.end()
  }).listen(_port, () => log('Inertia SSR server started.'))

  log(`Starting SSR server on port ${_port}...`)
}
