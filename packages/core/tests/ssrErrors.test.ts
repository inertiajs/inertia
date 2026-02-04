import { beforeEach, describe, expect, it } from 'vitest'
import { classifySSRError, formatConsoleError, setSourceMapResolver } from '../src/ssrErrors'

describe('SSR Errors', () => {
  beforeEach(() => {
    setSourceMapResolver(null as any)
  })

  describe('classifySSRError', () => {
    it('classifies browser API errors', () => {
      const error = new Error('window is not defined')
      const result = classifySSRError(error, 'Dashboard', '/dashboard')

      expect(result.type).toBe('browser-api')
      expect(result.browserApi).toBe('window')
      expect(result.component).toBe('Dashboard')
      expect(result.url).toBe('/dashboard')
      expect(result.hint).toContain('window')
    })

    it('detects various browser APIs', () => {
      const apis = [
        'window',
        'document',
        'localStorage',
        'sessionStorage',
        'navigator',
        'IntersectionObserver',
        'ResizeObserver',
        'fetch',
        'matchMedia',
        'requestAnimationFrame',
      ]

      for (const api of apis) {
        const error = new Error(`${api} is not defined`)
        const result = classifySSRError(error)

        expect(result.type).toBe('browser-api')
        expect(result.browserApi).toBe(api)
      }
    })

    it('classifies component resolution errors', () => {
      const error = new Error("Cannot find module './Pages/Dashboard'")
      const result = classifySSRError(error, 'Dashboard')

      expect(result.type).toBe('component-resolution')
      expect(result.hint).toContain('file exists')
    })

    it('classifies unknown errors as render errors', () => {
      const error = new Error('Something went wrong')
      const result = classifySSRError(error)

      expect(result.type).toBe('render')
      expect(result.hint).toContain('browser-specific code')
    })

    it('extracts source location from stack trace', () => {
      const error = new Error('window is not defined')
      error.stack = `Error: window is not defined
    at setup (/path/to/Dashboard.vue:10:5)
    at node_modules/vue/dist/vue.js:123:45`

      const result = classifySSRError(error)

      expect(result.sourceLocation).toBe('/path/to/Dashboard.vue:10:5')
    })

    it('skips node_modules in stack trace', () => {
      const error = new Error('window is not defined')
      error.stack = `Error: window is not defined
    at someFunction (node_modules/vue/dist/vue.js:123:45)
    at setup (/path/to/Dashboard.vue:10:5)`

      const result = classifySSRError(error)

      expect(result.sourceLocation).toBe('/path/to/Dashboard.vue:10:5')
    })

    it('includes timestamp', () => {
      const error = new Error('test')
      const result = classifySSRError(error)

      expect(result.timestamp).toBeDefined()
      expect(new Date(result.timestamp).getTime()).not.toBeNaN()
    })
  })

  describe('setSourceMapResolver', () => {
    it('uses resolver when extracting source location', () => {
      setSourceMapResolver((file, line, column) => {
        if (file.includes('app.js')) {
          return {
            file: '/original/source.vue',
            line: 42,
            column: 10,
          }
        }
        return null
      })

      const error = new Error('window is not defined')
      error.stack = `Error: window is not defined
    at setup (/path/to/ssr/app.js:1000:50)`

      const result = classifySSRError(error)

      expect(result.sourceLocation).toBe('/original/source.vue:42:10')
    })

    it('falls back to original location when resolver returns null', () => {
      setSourceMapResolver((_file, _line, _column) => null)

      const error = new Error('window is not defined')
      error.stack = `Error: window is not defined
    at setup (/path/to/Dashboard.vue:10:5)`

      const result = classifySSRError(error)

      expect(result.sourceLocation).toBe('/path/to/Dashboard.vue:10:5')
    })
  })

  describe('formatConsoleError', () => {
    it('includes error message and component', () => {
      const classified = {
        error: 'window is not defined',
        type: 'browser-api' as const,
        component: 'Dashboard',
        hint: 'Wrap in lifecycle hook',
        timestamp: new Date().toISOString(),
      }

      const output = formatConsoleError(classified)

      expect(output).toContain('SSR ERROR')
      expect(output).toContain('Dashboard')
      expect(output).toContain('window is not defined')
      expect(output).toContain('Hint')
    })

    it('includes source location', () => {
      const classified = {
        error: 'window is not defined',
        type: 'browser-api' as const,
        sourceLocation: '/path/to/Dashboard.vue:10:5',
        hint: 'Wrap in lifecycle hook',
        timestamp: new Date().toISOString(),
      }

      const output = formatConsoleError(classified)

      expect(output).toContain('Source:')
      expect(output).toContain('Dashboard.vue:10:5')
    })

    it('includes URL', () => {
      const classified = {
        error: 'window is not defined',
        type: 'browser-api' as const,
        url: '/dashboard/settings',
        hint: 'Wrap in lifecycle hook',
        timestamp: new Date().toISOString(),
      }

      const output = formatConsoleError(classified)

      expect(output).toContain('URL: /dashboard/settings')
    })

    it('makes paths relative to cwd', () => {
      const cwd = process.cwd()
      const classified = {
        error: 'window is not defined',
        type: 'browser-api' as const,
        sourceLocation: `${cwd}/resources/js/Pages/Dashboard.vue:10:5`,
        hint: 'Wrap in lifecycle hook',
        timestamp: new Date().toISOString(),
      }

      const output = formatConsoleError(classified)

      expect(output).toContain('Source: resources/js/Pages/Dashboard.vue:10:5')
      expect(output).not.toContain(cwd)
    })
  })
})
