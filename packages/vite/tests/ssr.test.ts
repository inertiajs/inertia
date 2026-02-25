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

    it('returns structured error response with type and hint', async () => {
      mockExistsSync.mockImplementation((path: string) => path.endsWith('resources/js/ssr.ts'))

      const plugin = inertia()
      const logger = createMockLogger()
      const server = createMockServer(logger)

      const error = new Error('window is not defined')
      server.ssrLoadModule.mockResolvedValue({
        default: vi.fn().mockRejectedValue(error),
      })

      plugin.configResolved!(createMockConfig(logger, false))
      plugin.configureServer!(server)

      const middleware = server.middlewares.use.mock.calls[0][1]
      const req = createMockRequest('POST', JSON.stringify({ component: 'Dashboard' }))
      const res = createMockResponse()

      await middleware(req, res, vi.fn())

      expect(res.statusCode).toBe(500)

      const response = JSON.parse(res.end.mock.calls[0][0])
      expect(response.type).toBe('browser-api')
      expect(response.browserApi).toBe('window')
      expect(response.component).toBe('Dashboard')
      expect(response.hint).toContain('lifecycle hook')
      expect(response.timestamp).toBeDefined()
    })

    it('includes component name in error response', async () => {
      mockExistsSync.mockImplementation((path: string) => path.endsWith('resources/js/ssr.ts'))

      const plugin = inertia()
      const logger = createMockLogger()
      const server = createMockServer(logger)

      server.ssrLoadModule.mockResolvedValue({
        default: vi.fn().mockRejectedValue(new Error("Cannot find module './Pages/Users'")),
      })

      plugin.configResolved!(createMockConfig(logger, false))
      plugin.configureServer!(server)

      const middleware = server.middlewares.use.mock.calls[0][1]
      const req = createMockRequest('POST', JSON.stringify({ component: 'Users/Index' }))
      const res = createMockResponse()

      await middleware(req, res, vi.fn())

      const response = JSON.parse(res.end.mock.calls[0][0])
      expect(response.type).toBe('component-resolution')
      expect(response.component).toBe('Users/Index')
    })

    it('logs error with hint to console', async () => {
      mockExistsSync.mockImplementation((path: string) => path.endsWith('resources/js/ssr.ts'))

      const plugin = inertia()
      const logger = createMockLogger()
      const server = createMockServer(logger)

      server.ssrLoadModule.mockResolvedValue({
        default: vi.fn().mockRejectedValue(new Error('document is not defined')),
      })

      plugin.configResolved!(createMockConfig(logger, false))
      plugin.configureServer!(server)

      const middleware = server.middlewares.use.mock.calls[0][1]
      const req = createMockRequest('POST', JSON.stringify({ component: 'Test' }))
      const res = createMockResponse()

      await middleware(req, res, vi.fn())

      expect(logger.error).toHaveBeenCalled()
      const loggedMessage = logger.error.mock.calls[0][0]
      expect(loggedMessage).toContain('SSR ERROR')
      expect(loggedMessage).toContain('Test')
      expect(loggedMessage).toContain('Hint')
    })

    it('includes stack trace when handleErrors is enabled', async () => {
      mockExistsSync.mockImplementation((path: string) => path.endsWith('resources/js/ssr.ts'))

      const plugin = inertia({ ssr: { handleErrors: true } })
      const logger = createMockLogger()
      const server = createMockServer(logger)

      const error = new Error('window is not defined')
      error.stack = 'Error: window is not defined\n    at Dashboard.vue:10'
      server.ssrLoadModule.mockResolvedValue({
        default: vi.fn().mockRejectedValue(error),
      })

      plugin.configResolved!(createMockConfig(logger, false))
      plugin.configureServer!(server)

      const middleware = server.middlewares.use.mock.calls[0][1]
      const req = createMockRequest('POST', JSON.stringify({ component: 'Dashboard' }))
      const res = createMockResponse()

      await middleware(req, res, vi.fn())

      const loggedMessage = logger.error.mock.calls[0][0]
      expect(loggedMessage).toContain('Dashboard.vue:10')
    })

    it('throws raw error when handleErrors is disabled', async () => {
      mockExistsSync.mockImplementation((path: string) => path.endsWith('resources/js/ssr.ts'))

      const plugin = inertia({ ssr: { handleErrors: false } })
      const logger = createMockLogger()
      const server = createMockServer(logger)

      const error = new Error('window is not defined')
      error.stack = 'Error: window is not defined\n    at Dashboard.vue:10'
      server.ssrLoadModule.mockResolvedValue({
        default: vi.fn().mockRejectedValue(error),
      })

      plugin.configResolved!(createMockConfig(logger, false))
      plugin.configureServer!(server)

      const middleware = server.middlewares.use.mock.calls[0][1]
      const req = createMockRequest('POST', JSON.stringify({ component: 'Dashboard' }))
      const res = createMockResponse()

      await expect(middleware(req, res, vi.fn())).rejects.toThrow('window is not defined')
    })

    it('returns 500 with helpful message when request body is empty', async () => {
      mockExistsSync.mockImplementation((path: string) => path.endsWith('resources/js/ssr.ts'))

      const plugin = inertia()
      const logger = createMockLogger()
      const server = createMockServer(logger)

      plugin.configResolved!(createMockConfig(logger, false))
      plugin.configureServer!(server)

      const middleware = server.middlewares.use.mock.calls[0][1]
      const req = createMockRequest('POST', '')
      const res = createMockResponse()

      await middleware(req, res, vi.fn())

      expect(res.statusCode).toBe(500)

      const response = JSON.parse(res.end.mock.calls[0][0])
      expect(response.error).toBe('Request body is empty')
    })

    it('returns 500 with helpful message when request body is invalid JSON', async () => {
      mockExistsSync.mockImplementation((path: string) => path.endsWith('resources/js/ssr.ts'))

      const plugin = inertia()
      const logger = createMockLogger()
      const server = createMockServer(logger)

      plugin.configResolved!(createMockConfig(logger, false))
      plugin.configureServer!(server)

      const middleware = server.middlewares.use.mock.calls[0][1]
      const req = createMockRequest('POST', '{ invalid json }')
      const res = createMockResponse()

      await middleware(req, res, vi.fn())

      expect(res.statusCode).toBe(500)

      const response = JSON.parse(res.end.mock.calls[0][0])
      expect(response.error).toContain('Invalid JSON in request body')
    })
  })

  describe('CSS collection', () => {
    it('prepends CSS link tags from module graph to head', async () => {
      mockExistsSync.mockImplementation((path: string) => path.endsWith('resources/js/ssr.ts'))

      const plugin = inertia()
      const logger = createMockLogger()
      const server = createMockServer(logger)

      const cssModule = {
        url: '/resources/css/app.css',
        id: '/project/resources/css/app.css',
        importedModules: new Set(),
      }
      const jsModule = {
        url: '/resources/js/utils.js',
        id: '/project/resources/js/utils.js',
        importedModules: new Set(),
      }
      const entryModule = {
        url: '/resources/js/ssr.ts',
        id: '/project/resources/js/ssr.ts',
        importedModules: new Set([cssModule, jsModule]),
      }

      server.environments.ssr.moduleGraph.getModuleById.mockImplementation((id: string) =>
        id === '/project/resources/js/ssr.ts' ? entryModule : undefined,
      )
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

      const response = JSON.parse(res.end.mock.calls[0][0])
      expect(response.head).toEqual([
        '<link rel="stylesheet" href="http://localhost:5173/resources/css/app.css" data-vite-dev-id="/project/resources/css/app.css">',
        '<title>Test</title>',
      ])
    })

    it('traverses nested module imports to find CSS', async () => {
      mockExistsSync.mockImplementation((path: string) => path.endsWith('resources/js/ssr.ts'))

      const plugin = inertia()
      const logger = createMockLogger()
      const server = createMockServer(logger)

      const deepCssModule = {
        url: '/resources/css/components.css',
        id: '/project/resources/css/components.css',
        importedModules: new Set(),
      }
      const middleModule = {
        url: '/resources/js/component.js',
        id: '/project/resources/js/component.js',
        importedModules: new Set([deepCssModule]),
      }
      const entryModule = {
        url: '/resources/js/ssr.ts',
        id: '/project/resources/js/ssr.ts',
        importedModules: new Set([middleModule]),
      }

      server.environments.ssr.moduleGraph.getModuleById.mockImplementation((id: string) =>
        id === '/project/resources/js/ssr.ts' ? entryModule : undefined,
      )
      server.ssrLoadModule.mockResolvedValue({
        default: vi.fn().mockResolvedValue({
          head: [],
          body: '<div id="app">Hello</div>',
        }),
      })

      plugin.configResolved!(createMockConfig(logger, false))
      plugin.configureServer!(server)

      const middleware = server.middlewares.use.mock.calls[0][1]
      const req = createMockRequest('POST', JSON.stringify({ component: 'Test', props: {} }))
      const res = createMockResponse()

      await middleware(req, res, vi.fn())

      const response = JSON.parse(res.end.mock.calls[0][0])
      expect(response.head).toEqual([
        '<link rel="stylesheet" href="http://localhost:5173/resources/css/components.css" data-vite-dev-id="/project/resources/css/components.css">',
      ])
    })

    it('detects preprocessor stylesheets like SCSS and Less', async () => {
      mockExistsSync.mockImplementation((path: string) => path.endsWith('resources/js/ssr.ts'))

      const plugin = inertia()
      const logger = createMockLogger()
      const server = createMockServer(logger)

      const scssModule = {
        url: '/resources/css/app.scss',
        id: '/project/resources/css/app.scss',
        importedModules: new Set(),
      }
      const lessModule = {
        url: '/resources/css/vendor.less',
        id: '/project/resources/css/vendor.less',
        importedModules: new Set(),
      }
      const entryModule = {
        url: '/resources/js/ssr.ts',
        id: '/project/resources/js/ssr.ts',
        importedModules: new Set([scssModule, lessModule]),
      }

      server.environments.ssr.moduleGraph.getModuleById.mockImplementation((id: string) =>
        id === '/project/resources/js/ssr.ts' ? entryModule : undefined,
      )
      server.ssrLoadModule.mockResolvedValue({
        default: vi.fn().mockResolvedValue({
          head: [],
          body: '<div id="app">Hello</div>',
        }),
      })

      plugin.configResolved!(createMockConfig(logger, false))
      plugin.configureServer!(server)

      const middleware = server.middlewares.use.mock.calls[0][1]
      const req = createMockRequest('POST', JSON.stringify({ component: 'Test', props: {} }))
      const res = createMockResponse()

      await middleware(req, res, vi.fn())

      const response = JSON.parse(res.end.mock.calls[0][0])
      expect(response.head).toEqual([
        '<link rel="stylesheet" href="http://localhost:5173/resources/css/app.scss" data-vite-dev-id="/project/resources/css/app.scss">',
        '<link rel="stylesheet" href="http://localhost:5173/resources/css/vendor.less" data-vite-dev-id="/project/resources/css/vendor.less">',
      ])
    })

    it('returns no CSS links when entry module is not in graph', async () => {
      mockExistsSync.mockImplementation((path: string) => path.endsWith('resources/js/ssr.ts'))

      const plugin = inertia()
      const logger = createMockLogger()
      const server = createMockServer(logger)

      server.environments.ssr.moduleGraph.getModuleById.mockReturnValue(undefined)
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

      const response = JSON.parse(res.end.mock.calls[0][0])
      expect(response.head).toEqual(['<title>Test</title>'])
    })
  })

  describe('SSR transform', () => {
    it('wraps createInertiaApp with server bootstrap for Vue', () => {
      mockExistsSync.mockReturnValue(false)

      const plugin = inertia()
      const logger = createMockLogger()

      plugin.configResolved!(createMockConfig(logger, false))

      const code = `import { createInertiaApp } from '@inertiajs/vue3'
createInertiaApp({ resolve: (name) => name })`
      const result = plugin.transform!(code, 'app.ts', { ssr: true })

      expect(result).toContain("import createServer from '@inertiajs/vue3/server'")
      expect(result).toContain("import { renderToString } from 'vue/server-renderer'")
      expect(result).toContain('const render = await createInertiaApp')
      expect(result).toContain('const renderPage = (page) => render(page, renderToString)')
      expect(result).toContain('if (import.meta.env.PROD)')
      expect(result).toContain('createServer(renderPage)')
      expect(result).toContain('export default renderPage')
    })

    it('wraps createInertiaApp with server bootstrap for Svelte', () => {
      mockExistsSync.mockReturnValue(false)

      const plugin = inertia()
      const logger = createMockLogger()

      plugin.configResolved!(createMockConfig(logger, false))

      const code = `import { createInertiaApp } from '@inertiajs/svelte'
createInertiaApp({ resolve: (name) => name })`
      const result = plugin.transform!(code, 'app.ts', { ssr: true })

      expect(result).toContain("import createServer from '@inertiajs/svelte/server'")
      expect(result).toContain("import { render } from 'svelte/server'")
      expect(result).toContain('const renderPage = (page) => ssr(page, render)')
      expect(result).toContain('if (import.meta.env.PROD)')
      expect(result).toContain('createServer(renderPage)')
      expect(result).toContain('export default renderPage')
    })

    it('passes SSR config to server', () => {
      mockExistsSync.mockReturnValue(false)

      const plugin = inertia({ ssr: { port: 13715, cluster: true } })
      const logger = createMockLogger()

      plugin.configResolved!(createMockConfig(logger, false))

      const code = `import { createInertiaApp } from '@inertiajs/vue3'
createInertiaApp({})`
      const result = plugin.transform!(code, 'app.ts', { ssr: true })

      expect(result).toContain('createServer(renderPage, {"port":13715,"cluster":true})')
    })

    it('uses same transform for both dev and production', () => {
      mockExistsSync.mockReturnValue(false)

      const plugin = inertia()
      const logger = createMockLogger()

      plugin.configResolved!({ ...createMockConfig(logger, false), command: 'serve' } as ResolvedConfig)

      const code = `import { createInertiaApp } from '@inertiajs/vue3'
createInertiaApp({})`
      const result = plugin.transform!(code, 'app.ts', { ssr: true })

      expect(result).toContain('export default renderPage')
      expect(result).toContain('if (import.meta.env.PROD)')
      expect(result).toContain('createServer(renderPage)')
    })

    it('does not apply SSR transform to client builds', () => {
      mockExistsSync.mockReturnValue(false)

      const plugin = inertia()
      const logger = createMockLogger()

      plugin.configResolved!(createMockConfig(logger, false))

      const code = `import { createInertiaApp } from '@inertiajs/vue3'
createInertiaApp({ resolve: (name) => name })`
      const result = plugin.transform!(code, 'app.ts', { ssr: false })

      expect(result).toBeNull()
    })

    it('does not transform when no framework is detected', () => {
      mockExistsSync.mockReturnValue(false)

      const plugin = inertia()
      const logger = createMockLogger()

      plugin.configResolved!(createMockConfig(logger, false))

      const code = `createInertiaApp({})`
      const result = plugin.transform!(code, 'app.ts', { ssr: true })

      expect(result).toBeNull()
    })
  })

  describe('ssr: false', () => {
    it('does not add middleware when ssr is disabled', () => {
      mockExistsSync.mockImplementation((path: string) => path.endsWith('resources/js/ssr.ts'))

      const plugin = inertia({ ssr: false })
      const logger = createMockLogger()
      const server = createMockServer(logger)

      plugin.configResolved!(createMockConfig(logger, false))
      plugin.configureServer!(server)

      expect(server.middlewares.use).not.toHaveBeenCalled()
      expect(logger.info).not.toHaveBeenCalled()
    })

    it('does not apply SSR transform when ssr is disabled', () => {
      mockExistsSync.mockImplementation((path: string) => path.endsWith('resources/js/ssr.ts'))

      const plugin = inertia({ ssr: false })
      const logger = createMockLogger()

      plugin.configResolved!(createMockConfig(logger, false))

      const code = `import { createInertiaApp } from '@inertiajs/vue3'
createInertiaApp({ resolve: (name) => name })`
      const result = plugin.transform!(code, 'app.ts', { ssr: true })

      expect(result).toBeNull()
    })

    it('does not configure SSR build options when ssr is disabled', () => {
      mockExistsSync.mockImplementation((path: string) => path.endsWith('resources/js/ssr.ts'))

      const plugin = inertia({ ssr: false })
      const logger = createMockLogger()

      plugin.configResolved!(createMockConfig(logger, false))

      const result = plugin.config!({ root: '/project' }, {
        command: 'build',
        mode: 'production',
        isSsrBuild: true,
      } as any)

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
    environments: { ssr: { moduleGraph: { getModuleById: vi.fn() } } },
    resolvedUrls: { local: ['http://localhost:5173/'], network: [] },
    config: { logger, base: '/', root: '/project' },
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
