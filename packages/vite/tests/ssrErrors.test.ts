import { describe, expect, it } from 'vitest'
import {
  classifySSRError,
  detectBrowserApi,
  formatConsoleError,
  getBrowserApiHint,
  getComponentResolutionHint,
  getRenderErrorHint,
  isComponentResolutionError,
} from '../src/ssrErrors'

describe('SSR Errors', () => {
  describe('detectBrowserApi', () => {
    it('detects "window is not defined"', () => {
      const error = new Error('ReferenceError: window is not defined')
      expect(detectBrowserApi(error)).toBe('window')
    })

    it('detects "document is not defined"', () => {
      const error = new Error('document is not defined')
      expect(detectBrowserApi(error)).toBe('document')
    })

    it('detects localStorage', () => {
      const error = new Error("ReferenceError: localStorage is not defined")
      expect(detectBrowserApi(error)).toBe('localStorage')
    })

    it('detects sessionStorage', () => {
      const error = new Error('sessionStorage is not defined')
      expect(detectBrowserApi(error)).toBe('sessionStorage')
    })

    it('detects navigator', () => {
      const error = new Error("navigator is not defined")
      expect(detectBrowserApi(error)).toBe('navigator')
    })

    it('detects location', () => {
      const error = new Error('location is not defined')
      expect(detectBrowserApi(error)).toBe('location')
    })

    it('detects history', () => {
      const error = new Error('history is not defined')
      expect(detectBrowserApi(error)).toBe('history')
    })

    it('detects matchMedia', () => {
      const error = new Error('matchMedia is not defined')
      expect(detectBrowserApi(error)).toBe('matchMedia')
    })

    it('detects IntersectionObserver', () => {
      const error = new Error('IntersectionObserver is not defined')
      expect(detectBrowserApi(error)).toBe('IntersectionObserver')
    })

    it('detects ResizeObserver', () => {
      const error = new Error('ResizeObserver is not defined')
      expect(detectBrowserApi(error)).toBe('ResizeObserver')
    })

    it('detects MutationObserver', () => {
      const error = new Error('MutationObserver is not defined')
      expect(detectBrowserApi(error)).toBe('MutationObserver')
    })

    it('detects requestAnimationFrame', () => {
      const error = new Error('requestAnimationFrame is not defined')
      expect(detectBrowserApi(error)).toBe('requestAnimationFrame')
    })

    it('detects fetch', () => {
      const error = new Error('fetch is not defined')
      expect(detectBrowserApi(error)).toBe('fetch')
    })

    it('detects XMLHttpRequest', () => {
      const error = new Error('XMLHttpRequest is not defined')
      expect(detectBrowserApi(error)).toBe('XMLHttpRequest')
    })

    it('detects matchMedia', () => {
      const error = new Error('matchMedia is not defined')
      expect(detectBrowserApi(error)).toBe('matchMedia')
    })

    it('detects requestAnimationFrame', () => {
      const error = new Error('requestAnimationFrame is not defined')
      expect(detectBrowserApi(error)).toBe('requestAnimationFrame')
    })

    it('detects property access patterns', () => {
      const error = new Error("Cannot read properties of undefined (reading 'window')")
      expect(detectBrowserApi(error)).toBe('window')
    })

    it('detects quoted "is not defined" patterns', () => {
      const error = new Error("'document' is not defined")
      expect(detectBrowserApi(error)).toBe('document')
    })

    it('returns null for non-browser-api errors', () => {
      const error = new Error('Some other error')
      expect(detectBrowserApi(error)).toBeNull()
    })
  })

  describe('isComponentResolutionError', () => {
    it('detects "Cannot find module" errors', () => {
      const error = new Error("Cannot find module './Pages/Dashboard'")
      expect(isComponentResolutionError(error)).toBe(true)
    })

    it('detects "Failed to resolve" errors', () => {
      const error = new Error('Failed to resolve import "./Pages/Dashboard"')
      expect(isComponentResolutionError(error)).toBe(true)
    })

    it('detects "Module not found" errors', () => {
      const error = new Error('Module not found: ./Pages/Dashboard')
      expect(isComponentResolutionError(error)).toBe(true)
    })

    it('detects "Could not resolve" errors', () => {
      const error = new Error('Could not resolve "./Pages/Dashboard"')
      expect(isComponentResolutionError(error)).toBe(true)
    })

    it('returns false for non-resolution errors', () => {
      const error = new Error('window is not defined')
      expect(isComponentResolutionError(error)).toBe(false)
    })
  })

  describe('getBrowserApiHint', () => {
    it('provides hint for window', () => {
      const hint = getBrowserApiHint('window')
      expect(hint).toContain("doesn't exist in Node.js")
      expect(hint).toContain('onMounted/useEffect/onMount')
      expect(hint).toContain('typeof window')
    })

    it('provides hint for document', () => {
      const hint = getBrowserApiHint('document')
      expect(hint).toContain("doesn't exist in Node.js")
      expect(hint).toContain('lifecycle hook')
    })

    it('provides hint for localStorage', () => {
      const hint = getBrowserApiHint('localStorage')
      expect(hint).toContain('localStorage')
      expect(hint).toContain('typeof localStorage')
    })

    it('provides hint for IntersectionObserver', () => {
      const hint = getBrowserApiHint('IntersectionObserver')
      expect(hint).toContain('observers')
      expect(hint).toContain('lifecycle hook')
    })

    it('provides hint for fetch', () => {
      const hint = getBrowserApiHint('fetch')
      expect(hint).toContain('server')
      expect(hint).toContain('controller')
    })

    it('provides generic hint for unknown APIs', () => {
      const hint = getBrowserApiHint('unknownApi')
      expect(hint).toContain("doesn't exist in Node.js")
      expect(hint).toContain('lifecycle hook')
    })
  })

  describe('getComponentResolutionHint', () => {
    it('includes component name when provided', () => {
      const hint = getComponentResolutionHint('Dashboard')
      expect(hint).toContain('"Dashboard"')
      expect(hint).toContain('file exists')
    })

    it('provides hint without component name', () => {
      const hint = getComponentResolutionHint()
      expect(hint).toContain('Could not resolve component')
      expect(hint).toContain('file exists')
    })
  })

  describe('getRenderErrorHint', () => {
    it('suggests checking for browser-specific code', () => {
      const hint = getRenderErrorHint()
      expect(hint).toContain('browser-specific code')
      expect(hint).toContain('lifecycle hook')
    })
  })

  describe('classifySSRError', () => {
    it('classifies browser API errors', () => {
      const error = new Error('window is not defined')
      const result = classifySSRError(error, 'Dashboard')

      expect(result.type).toBe('browser-api')
      expect(result.browserApi).toBe('window')
      expect(result.component).toBe('Dashboard')
      expect(result.hint).toContain('window')
      expect(result.timestamp).toBeDefined()
    })

    it('classifies component resolution errors', () => {
      const error = new Error("Cannot find module './Pages/Dashboard'")
      const result = classifySSRError(error, 'Dashboard')

      expect(result.type).toBe('component-resolution')
      expect(result.component).toBe('Dashboard')
      expect(result.hint).toContain('file exists')
    })

    it('classifies unknown errors as render errors', () => {
      const error = new Error('Something went wrong')
      const result = classifySSRError(error, 'Dashboard')

      expect(result.type).toBe('render')
      expect(result.hint).toContain('browser-specific code')
    })

    it('includes stack trace', () => {
      const error = new Error('window is not defined')
      error.stack = 'Error: window is not defined\n    at Dashboard.vue:10'
      const result = classifySSRError(error)

      expect(result.stack).toBe(error.stack)
    })
  })

  describe('formatConsoleError', () => {
    it('formats error with source location', () => {
      const classified = {
        error: 'window is not defined',
        type: 'browser-api' as const,
        component: 'Dashboard',
        browserApi: 'window',
        hint: 'Wrap in lifecycle hook',
        stack: 'Error: window is not defined\n    at setup (/path/to/Dashboard.vue:10:5)\n    at node_modules/vue/dist/vue.js:123:45',
        sourceLocation: '/path/to/Dashboard.vue:10:5',
        timestamp: '2024-01-15T10:30:45.000Z',
      }

      const output = formatConsoleError(classified)

      expect(output).toContain('SSR ERROR')
      expect(output).toContain('Dashboard')
      expect(output).toContain('window is not defined')
      expect(output).toContain('Hint')
      expect(output).toContain('Wrap in lifecycle hook')
      expect(output).toContain('Source: /path/to/Dashboard.vue:10:5')
    })

    it('displays source location when provided', () => {
      const classified = {
        error: 'window is not defined',
        type: 'browser-api' as const,
        component: 'Dashboard',
        hint: 'Wrap in lifecycle hook',
        sourceLocation: '/Users/dev/project/Dashboard.vue:25:13',
        timestamp: '2024-01-15T10:30:45.000Z',
      }

      const output = formatConsoleError(classified)

      expect(output).toContain('Source: /Users/dev/project/Dashboard.vue:25:13')
    })

    it('makes source location relative to project root', () => {
      const classified = {
        error: 'window is not defined',
        type: 'browser-api' as const,
        component: 'Dashboard',
        hint: 'Wrap in lifecycle hook',
        sourceLocation: '/Users/dev/project/resources/js/Pages/Dashboard.vue:25:13',
        timestamp: '2024-01-15T10:30:45.000Z',
      }

      const output = formatConsoleError(classified, '/Users/dev/project')

      expect(output).toContain('Source: resources/js/Pages/Dashboard.vue:25:13')
      expect(output).not.toContain('/Users/dev/project')
    })

    it('displays URL when provided', () => {
      const classified = {
        error: 'window is not defined',
        type: 'browser-api' as const,
        component: 'Dashboard',
        url: '/dashboard/settings',
        hint: 'Wrap in lifecycle hook',
        sourceLocation: '/path/to/Dashboard.vue:10:5',
        timestamp: '2024-01-15T10:30:45.000Z',
      }

      const output = formatConsoleError(classified)

      expect(output).toContain('URL: /dashboard/settings')
    })

    it('includes full stack trace in debug mode', () => {
      const classified = {
        error: 'window is not defined',
        type: 'browser-api' as const,
        component: 'Dashboard',
        browserApi: 'window',
        hint: 'Wrap in lifecycle hook',
        stack: 'Error: window is not defined\n    at setup (/path/to/Dashboard.vue:10:5)\n    at callWithErrorHandling (node_modules/vue/dist/vue.js:123:45)',
        sourceLocation: '/path/to/Dashboard.vue:10:5',
        timestamp: '2024-01-15T10:30:45.000Z',
      }

      const output = formatConsoleError(classified, undefined, true)

      expect(output).toContain('at setup (/path/to/Dashboard.vue:10:5)')
      expect(output).toContain('callWithErrorHandling')
    })

    it('formats error without component', () => {
      const classified = {
        error: 'Something went wrong',
        type: 'render' as const,
        hint: 'Check the component',
        timestamp: '2024-01-15T10:30:45.000Z',
      }

      const output = formatConsoleError(classified)

      expect(output).toContain('SSR ERROR')
      expect(output).toContain('Something went wrong')
    })

    it('formats error without stack trace', () => {
      const classified = {
        error: 'Something went wrong',
        type: 'render' as const,
        hint: 'Check the component',
        timestamp: '2024-01-15T10:30:45.000Z',
      }

      const output = formatConsoleError(classified)

      expect(output).not.toContain('at ')
    })
  })
})
