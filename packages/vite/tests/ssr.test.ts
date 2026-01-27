import type { ResolvedConfig, ViteDevServer } from 'vite'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import inertia from '../src'

vi.mock('fs', async () => {
  const actual = await vi.importActual<typeof import('fs')>('fs')
  return {
    ...actual,
    existsSync: vi.fn((path: string) => actual.existsSync(path)),
  }
})

import { existsSync } from 'fs'

const mockExistsSync = existsSync as ReturnType<typeof vi.fn>

describe('SSR', () => {
  beforeEach(() => vi.clearAllMocks())
  afterEach(() => vi.clearAllMocks())

  describe('entry detection', () => {
    it('uses explicit string entry when file exists', () => {
      mockExistsSync.mockImplementation((path: string) => path.endsWith('custom/ssr.ts'))

      const plugin = inertia({ ssr: 'custom/ssr.ts' })
      const logger = createMockLogger()

      plugin.configResolved!(createMockConfig(logger, true))

      expect(logger.info).toHaveBeenCalledWith('Inertia SSR entry: custom/ssr.ts')
    })

    it('uses explicit object entry when file exists', () => {
      mockExistsSync.mockImplementation((path: string) => path.endsWith('custom/ssr.ts'))

      const plugin = inertia({ ssr: { entry: 'custom/ssr.ts' } })
      const logger = createMockLogger()

      plugin.configResolved!(createMockConfig(logger, true))

      expect(logger.info).toHaveBeenCalledWith('Inertia SSR entry: custom/ssr.ts')
    })

    it('warns when explicit entry does not exist', () => {
      mockExistsSync.mockReturnValue(false)

      const plugin = inertia({ ssr: 'missing/ssr.ts' })
      const logger = createMockLogger()

      plugin.configResolved!(createMockConfig(logger, true))

      expect(logger.warn).toHaveBeenCalledWith('Inertia SSR entry not found: missing/ssr.ts')
    })

    it('auto-detects Laravel SSR entries', () => {
      const entries = ['resources/js/ssr.ts', 'resources/js/ssr.tsx', 'resources/js/ssr.js', 'resources/js/ssr.jsx']

      for (const entry of entries) {
        vi.clearAllMocks()
        mockExistsSync.mockImplementation((path: string) => path.endsWith(entry))

        const plugin = inertia()
        const logger = createMockLogger()

        plugin.configResolved!(createMockConfig(logger, true))

        expect(logger.info).toHaveBeenCalledWith(`Inertia SSR entry: ${entry}`)
      }
    })

    it('auto-detects non-Laravel SSR entries', () => {
      mockExistsSync.mockImplementation((path: string) => path.endsWith('src/ssr.ts'))

      const plugin = inertia()
      const logger = createMockLogger()

      plugin.configResolved!(createMockConfig(logger, true))

      expect(logger.info).toHaveBeenCalledWith('Inertia SSR entry: src/ssr.ts')
    })

    it('auto-detects app.ts as fallback SSR entry', () => {
      mockExistsSync.mockImplementation((path: string) => path.endsWith('resources/js/app.ts'))

      const plugin = inertia()
      const logger = createMockLogger()

      plugin.configResolved!(createMockConfig(logger, true))

      expect(logger.info).toHaveBeenCalledWith('Inertia SSR entry: resources/js/app.ts')
    })

    it('does not log when no entry is found', () => {
      mockExistsSync.mockReturnValue(false)

      const plugin = inertia()
      const logger = createMockLogger()

      plugin.configResolved!(createMockConfig(logger, false))

      expect(logger.info).not.toHaveBeenCalled()
      expect(logger.warn).not.toHaveBeenCalled()
    })
  })

  describe('dev server', () => {
    it('adds middleware when entry exists', () => {
      mockExistsSync.mockImplementation((path: string) => path.endsWith('resources/js/ssr.ts'))

      const plugin = inertia()
      const logger = createMockLogger()
      const server = createMockServer(logger)

      plugin.configResolved!(createMockConfig(logger, false))
      plugin.configureServer!(server)

      expect(server.middlewares.use).toHaveBeenCalledWith('/__inertia_ssr', expect.any(Function))
      expect(logger.info).toHaveBeenCalledWith('Inertia SSR dev endpoint: /__inertia_ssr')
    })

    it('does not add middleware when no entry exists', () => {
      mockExistsSync.mockReturnValue(false)

      const plugin = inertia()
      const logger = createMockLogger()
      const server = createMockServer(logger)

      plugin.configResolved!(createMockConfig(logger, false))
      plugin.configureServer!(server)

      expect(server.middlewares.use).not.toHaveBeenCalled()
    })
  })

  describe('middleware', () => {
    it('ignores non-POST requests', async () => {
      mockExistsSync.mockImplementation((path: string) => path.endsWith('resources/js/ssr.ts'))

      const plugin = inertia()
      const logger = createMockLogger()
      const server = createMockServer(logger)

      plugin.configResolved!(createMockConfig(logger, false))
      plugin.configureServer!(server)

      const middleware = server.middlewares.use.mock.calls[0][1]
      const next = vi.fn()

      await middleware({ method: 'GET' }, {}, next)

      expect(next).toHaveBeenCalled()
    })

    it('renders page and returns JSON response', async () => {
      mockExistsSync.mockImplementation((path: string) => path.endsWith('resources/js/ssr.ts'))

      const plugin = inertia()
      const logger = createMockLogger()
      const server = createMockServer(logger)

      server.ssrLoadModule.mockResolvedValue({
        default: vi.fn().mockResolvedValue({
          head: ['<title>Test</title>'],
          body: '<div id="app">Hello</div>',
        }),
      })

      plugin.configResolved!(createMockConfig(logger, false))
      plugin.configureServer!(server)

      const middleware = server.middlewares.use.mock.calls[0][1]
      const req = createMockRequest('POST', JSON.stringify({ component: 'Test', props: {} }))
      const res = createMockResponse()

      await middleware(req, res, vi.fn())

      expect(server.ssrLoadModule).toHaveBeenCalledWith('resources/js/ssr.ts')
      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json')
      expect(res.end).toHaveBeenCalledWith(
        JSON.stringify({ head: ['<title>Test</title>'], body: '<div id="app">Hello</div>' }),
      )
    })

    it('returns 500 when module does not export render function', async () => {
      mockExistsSync.mockImplementation((path: string) => path.endsWith('resources/js/ssr.ts'))

      const plugin = inertia()
      const logger = createMockLogger()
      const server = createMockServer(logger)

      server.ssrLoadModule.mockResolvedValue({ default: 'not a function' })

      plugin.configResolved!(createMockConfig(logger, false))
      plugin.configureServer!(server)

      const middleware = server.middlewares.use.mock.calls[0][1]
      const req = createMockRequest('POST', JSON.stringify({ component: 'Test' }))
      const res = createMockResponse()

      await middleware(req, res, vi.fn())

      expect(res.statusCode).toBe(500)
      expect(logger.error).toHaveBeenCalled()
    })

    it('returns 500 when render returns invalid response', async () => {
      mockExistsSync.mockImplementation((path: string) => path.endsWith('resources/js/ssr.ts'))

      const plugin = inertia()
      const logger = createMockLogger()
      const server = createMockServer(logger)

      server.ssrLoadModule.mockResolvedValue({
        default: vi.fn().mockResolvedValue({ invalid: 'response' }),
      })

      plugin.configResolved!(createMockConfig(logger, false))
      plugin.configureServer!(server)

      const middleware = server.middlewares.use.mock.calls[0][1]
      const req = createMockRequest('POST', JSON.stringify({ component: 'Test' }))
      const res = createMockResponse()

      await middleware(req, res, vi.fn())

      expect(res.statusCode).toBe(500)
    })

    it('applies source maps to errors', async () => {
      mockExistsSync.mockImplementation((path: string) => path.endsWith('resources/js/ssr.ts'))

      const plugin = inertia()
      const logger = createMockLogger()
      const server = createMockServer(logger)

      const error = new Error('Component not found')
      server.ssrLoadModule.mockResolvedValue({
        default: vi.fn().mockRejectedValue(error),
      })

      plugin.configResolved!(createMockConfig(logger, false))
      plugin.configureServer!(server)

      const middleware = server.middlewares.use.mock.calls[0][1]
      const req = createMockRequest('POST', JSON.stringify({ component: 'Missing' }))
      const res = createMockResponse()

      await middleware(req, res, vi.fn())

      expect(server.ssrFixStacktrace).toHaveBeenCalledWith(error)
      expect(res.statusCode).toBe(500)
    })
  })

  describe('transforms', () => {
    it('replaces INERTIA_SSR_DEV with true in dev mode', () => {
      mockExistsSync.mockReturnValue(false)

      const plugin = inertia()
      const logger = createMockLogger()

      plugin.configResolved!({ ...createMockConfig(logger, false), command: 'serve' } as ResolvedConfig)

      const code = 'if (import.meta.env.INERTIA_SSR_DEV) { console.log("dev") }'
      const result = plugin.transform!(code, 'app.ts', { ssr: true })

      expect(result).toContain('if (true)')
    })

    it('does not replace INERTIA_SSR_DEV in client code', () => {
      mockExistsSync.mockReturnValue(false)

      const plugin = inertia()
      const logger = createMockLogger()

      plugin.configResolved!({ ...createMockConfig(logger, false), command: 'serve' } as ResolvedConfig)

      const code = 'if (import.meta.env.INERTIA_SSR_DEV) { console.log("dev") }'
      const result = plugin.transform!(code, 'app.ts', { ssr: false })

      expect(result).toBeNull()
    })
  })

  describe('config', () => {
    it('adds SSR config defines during SSR build', () => {
      const plugin = inertia({ ssr: { port: 13715, cluster: true } })

      const result = plugin.config!({ build: { ssr: true } }, { command: 'build', mode: 'production' })

      expect(result).toEqual({
        define: {
          'import.meta.env.INERTIA_SSR_CONFIG': JSON.stringify({ port: 13715, cluster: true }),
        },
      })
    })

    it('does not add defines when no SSR options specified', () => {
      const plugin = inertia()

      const result = plugin.config!({ build: { ssr: true } }, { command: 'build', mode: 'production' })

      expect(result).toBeUndefined()
    })

    it('does not add defines for client build', () => {
      const plugin = inertia({ ssr: { port: 13715 } })

      const result = plugin.config!({}, { command: 'build', mode: 'production' })

      expect(result).toBeUndefined()
    })
  })
})

function createMockLogger() {
  return { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
}

function createMockConfig(logger: ReturnType<typeof createMockLogger>, ssr: boolean): ResolvedConfig {
  return { root: '/project', logger, plugins: [], build: { ssr }, command: 'build' } as unknown as ResolvedConfig
}

function createMockServer(logger: ReturnType<typeof createMockLogger>): ViteDevServer {
  return {
    middlewares: { use: vi.fn() },
    ssrLoadModule: vi.fn(),
    ssrFixStacktrace: vi.fn(),
    config: { logger },
  } as unknown as ViteDevServer
}

function createMockRequest(method: string, body: string) {
  let dataCallback: (chunk: string) => void
  let endCallback: () => void

  return {
    method,
    on: vi.fn((event: string, callback: (...args: unknown[]) => void) => {
      if (event === 'data') {
        dataCallback = callback
        setTimeout(() => dataCallback(body), 0)
      } else if (event === 'end') {
        endCallback = callback
        setTimeout(() => endCallback(), 1)
      }
    }),
  }
}

function createMockResponse() {
  return { setHeader: vi.fn(), statusCode: 200, end: vi.fn() }
}
