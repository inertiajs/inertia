import { createServer as createHttpServer } from 'node:http'
import type { AddressInfo } from 'node:net'
import { join } from 'node:path'
import { createLogger, createServer, type Plugin } from 'vite'
import { afterEach, describe, expect, it } from 'vitest'
import inertia, { type InertiaPluginOptions } from '../src'

const root = join(import.meta.dirname, 'fixtures', 'ssr-dev')

let close: (() => Promise<void>) | undefined

function virtualStylesheet(): Plugin {
  return {
    name: 'virtual-stylesheet',
    resolveId(id) {
      if (id.startsWith('virtual:theme.css')) {
        return id
      }
    },
    load(id) {
      if (id.startsWith('virtual:theme.css')) {
        return 'body { background: blue; }'
      }
    },
  }
}

async function startDevServer(options: InertiaPluginOptions) {
  const errors: string[] = []
  const logger = createLogger('silent')

  logger.error = (message) => {
    errors.push(message)
  }

  const server = await createServer({
    configFile: false,
    root,
    customLogger: logger,
    appType: 'custom',
    server: { middlewareMode: true, hmr: false, ws: false },
    plugins: [inertia(options), virtualStylesheet()],
  })

  const httpServer = createHttpServer(server.middlewares)

  await new Promise<void>((resolve) => httpServer.listen(0, '127.0.0.1', resolve))

  const { port } = httpServer.address() as AddressInfo

  close = async () => {
    await new Promise((resolve) => httpServer.close(resolve))
    await server.close()
  }

  return {
    errors,
    render: (component: string) =>
      fetch(`http://127.0.0.1:${port}/__inertia_ssr`, {
        method: 'POST',
        body: JSON.stringify({ component, props: {}, url: '/' }),
      }),
  }
}

describe('SSR dev server', () => {
  afterEach(async () => {
    await close?.()
    close = undefined
  })

  it.each([undefined, 'src/ssr.js'])('renders pages with stylesheet links (entry: %s)', async (entry) => {
    const { render } = await startDevServer({ ssr: entry })
    const response = await render('Home')

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
      head: [
        expect.stringMatching(
          /^<link rel="stylesheet" href="http:\/\/localhost:5173\/src\/app\.css" data-vite-dev-id=".+\/src\/app\.css">$/,
        ),
        '<link rel="stylesheet" href="http://localhost:5173/virtual:theme.css" data-vite-dev-id="virtual:theme.css">',
      ],
      body: '<div>Home</div>',
    })
  })

  it('logs render errors with a source path relative to the root', async () => {
    const { render, errors } = await startDevServer({})
    const response = await render('Broken')

    expect(response.status).toBe(500)
    expect(errors).toHaveLength(1)
    expect(errors[0]).toMatch(/Source: src\/ssr\.js:\d+:\d+/)
  })
})
