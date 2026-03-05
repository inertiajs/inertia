import { beforeEach, describe, expect, it } from 'vitest'
import { classifySSRError, formatConsoleError, setSourceMapResolver } from '../src/ssrErrors'

describe('SSR Errors', () => {
  beforeEach(() => {
    setSourceMapResolver(null)
  })

  describe('classifySSRError', () => {
    it('classifies browser API errors', () => {
      const error = new Error('window is not defined')
      const result = classifySSRError(error, 'Dashboard', '/dashboard')

      expect(result.type).toBe('browser-api')
      expect(result.browserApi).toBe('window')
      expect(result.component).toBe('Dashboard')
      expect(result.url).toBe('/dashboard')
      expect(result.hint).toContain("doesn't exist in Node.js")
      expect(result.hint).toContain('onMounted/useEffect/onMount')
    })

    it('detects various browser APIs', () => {
      const apis = [
        'window',
        'document',
        'localStorage',
        'sessionStorage',
        'navigator',
        'location',
        'history',
        'matchMedia',
        'IntersectionObserver',
        'ResizeObserver',
        'MutationObserver',
        'requestAnimationFrame',
        'fetch',
        'XMLHttpRequest',
      ]

      for (const api of apis) {
        const error = new Error(`${api} is not defined`)
        const result = classifySSRError(error)

        expect(result.type).toBe('browser-api')
        expect(result.browserApi).toBe(api)
      }
    })

    it('detects property access patterns', () => {
      const error = new Error("Cannot read properties of undefined (reading 'window')")
      const result = classifySSRError(error)

      expect(result.type).toBe('browser-api')
      expect(result.browserApi).toBe('window')
    })

    it('detects legacy property access patterns', () => {
      const error = new Error("Cannot read property 'document'")
      const result = classifySSRError(error)

      expect(result.type).toBe('browser-api')
      expect(result.browserApi).toBe('document')
    })

    it('detects quoted "is not defined" patterns', () => {
      const error = new Error("'document' is not defined")
      const result = classifySSRError(error)

      expect(result.type).toBe('browser-api')
      expect(result.browserApi).toBe('document')
    })

    it('provides category-specific hints for storage APIs', () => {
      const result = classifySSRError(new Error('localStorage is not defined'))

      expect(result.hint).toContain('typeof localStorage')
    })

    it('provides category-specific hints for observers', () => {
      const result = classifySSRError(new Error('IntersectionObserver is not defined'))

      expect(result.hint).toContain('observers')
      expect(result.hint).toContain('not at the module level')
    })

    it('provides category-specific hints for fetch', () => {
      const result = classifySSRError(new Error('fetch is not defined'))

      expect(result.hint).toContain('controller')
    })

    it('classifies component resolution errors', () => {
      const patterns = [
        "Cannot find module './Pages/Dashboard'",
        'Failed to resolve import "./Pages/Dashboard"',
        'Module not found: ./Pages/Dashboard',
        'Could not resolve "./Pages/Dashboard"',
      ]

      for (const message of patterns) {
        const result = classifySSRError(new Error(message), 'Dashboard')

        expect(result.type).toBe('component-resolution')
        expect(result.hint).toContain('file exists')
        expect(result.hint).toContain('case-sensitive')
      }
    })

    it('classifies unknown errors as render errors', () => {
      const error = new Error('Something went wrong')
      const result = classifySSRError(error)

      expect(result.type).toBe('render')
      expect(result.hint).toContain('browser-specific code')
      expect(result.hint).toContain('lifecycle hook')
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
          return { file: '/original/source.vue', line: 42, column: 10 }
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
      setSourceMapResolver(() => null)

      const error = new Error('window is not defined')
      error.stack = `Error: window is not defined
    at setup (/path/to/Dashboard.vue:10:5)`

      const result = classifySSRError(error)

      expect(result.sourceLocation).toBe('/path/to/Dashboard.vue:10:5')
    })
  })

  describe('formatConsoleError', () => {
    it('includes error message and component', () => {
      const classified = classifySSRError(new Error('window is not defined'), 'Dashboard')
      const output = formatConsoleError(classified)

      expect(output).toContain('SSR ERROR')
      expect(output).toContain('Dashboard')
      expect(output).toContain('window is not defined')
      expect(output).toContain('Hint')
    })

    it('includes source location', () => {
      const error = new Error('window is not defined')
      error.stack = `Error: window is not defined
    at setup (/path/to/Dashboard.vue:10:5)`

      const classified = classifySSRError(error)
      const output = formatConsoleError(classified)

      expect(output).toContain('Source:')
      expect(output).toContain('Dashboard.vue:10:5')
    })

    it('includes URL', () => {
      const classified = classifySSRError(new Error('window is not defined'), undefined, '/dashboard/settings')
      const output = formatConsoleError(classified)

      expect(output).toContain('URL: /dashboard/settings')
    })

    it('makes paths relative to cwd by default', () => {
      const cwd = process.cwd()
      const error = new Error('window is not defined')
      error.stack = `Error: window is not defined
    at setup (${cwd}/resources/js/Pages/Dashboard.vue:10:5)`

      const classified = classifySSRError(error)
      const output = formatConsoleError(classified)
      const sourceLine = output.split('\n').find((line) => line.includes('Source:'))

      expect(sourceLine).toContain('Source: resources/js/Pages/Dashboard.vue:10:5')
      expect(sourceLine).not.toContain(cwd)
    })

    it('makes paths relative to provided root', () => {
      const error = new Error('window is not defined')
      error.stack = `Error: window is not defined
    at setup (/Users/dev/project/resources/js/Pages/Dashboard.vue:25:13)`

      const classified = classifySSRError(error)
      const output = formatConsoleError(classified, '/Users/dev/project')
      const sourceLine = output.split('\n').find((line) => line.includes('Source:'))

      expect(sourceLine).toContain('Source: resources/js/Pages/Dashboard.vue:25:13')
      expect(sourceLine).not.toContain('/Users/dev/project')
    })

    it('returns one-liner when handleErrors is false', () => {
      const classified = classifySSRError(new Error('window is not defined'), 'Dashboard')
      const output = formatConsoleError(classified, undefined, false)

      expect(output).toBe('SSR Error [Dashboard]: window is not defined')
    })

    it('includes stack trace', () => {
      const error = new Error('window is not defined')
      error.stack = 'Error: window is not defined\n    at setup (/path/to/Dashboard.vue:10:5)'

      const classified = classifySSRError(error)
      const output = formatConsoleError(classified)

      expect(output).toContain('at setup (/path/to/Dashboard.vue:10:5)')
    })

    it('includes suppressed warnings count', () => {
      const classified = classifySSRError(new Error('window is not defined'))
      const output = formatConsoleError(classified, undefined, true, ['[Vue warn]: ...', '[Vue warn]: ...'])

      expect(output).toContain('Suppressed 2 framework warning(s)')
    })
  })
})
