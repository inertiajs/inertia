import { vi } from 'vitest'
import type { LiveChannel, LiveProp } from '../src/types'

type Request = { url: string; headers: Record<string, string> }

/**
 * Enough of a browser for the real router to run in Node. Requests never
 * resolve, which is what makes them observable: an issued reload stays in
 * flight, exactly as it would while a payload for the same prop arrives.
 */
export const stubBrowser = (): Request[] => {
  const requests: Request[] = []

  class FakeXhr {
    public upload = { addEventListener: () => {} }
    protected headers: Record<string, string> = {}

    public open(_method: string, url: string) {
      requests.push({ url, headers: this.headers })
    }

    public setRequestHeader(name: string, value: string) {
      this.headers[name] = value
    }

    public addEventListener() {}

    public getAllResponseHeaders() {
      return ''
    }

    public send() {}

    public abort() {}
  }

  vi.stubGlobal('XMLHttpRequest', FakeXhr)

  vi.stubGlobal('document', {
    dispatchEvent: () => true,
    addEventListener: () => {},
    removeEventListener: () => {},
    querySelectorAll: () => [],
    visibilityState: 'visible',
    hidden: false,
    cookie: '',
  })

  vi.stubGlobal('window', {
    setTimeout,
    clearTimeout,
    location: new URL('http://localhost/orders'),
    navigator: { userAgent: 'node' },
    addEventListener: () => {},
    removeEventListener: () => {},
    requestAnimationFrame: (callback: FrameRequestCallback) => callback(0),
    history: {
      state: {},
      scrollRestoration: 'auto',
      replaceState: () => {},
      pushState: () => {},
    },
    sessionStorage: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    },
    scrollTo: () => {},
  })

  return requests
}

export const orders: LiveChannel = { name: 'orders.1', type: 'private' }
export const reports: LiveChannel = { name: 'reports', type: 'public' }
export const stats: LiveChannel = { name: 'stats', type: 'public' }

export const listeners = (channel: LiveChannel, ...events: string[]): LiveProp => ({
  listeners: [{ channel, events }],
})

export const withEvent = (event: string, extra: Record<string, unknown> = {}) => ({
  __inertia: { event, ...extra },
})
