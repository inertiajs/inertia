import { vi } from 'vitest'
import type { LiveChannel, LiveProp, Page } from '../src/types'

export type Request = { url: string; headers: Record<string, string> }

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

/**
 * The page the router boots on, at the URL `stubBrowser()` puts the window on.
 */
export const ordersPage = (page: Partial<Page> = {}): Page =>
  ({
    component: 'Orders',
    url: '/orders',
    version: '1',
    props: {},
    flash: {},
    rememberedState: {},
    rescuedProps: [],
    clearHistory: false,
    encryptHistory: false,
    ...page,
  }) as Page

/**
 * Long enough for the live engine's collect window and the swap that follows.
 */
export const settle = () => new Promise((resolve) => setTimeout(resolve, 80))

export const partialData = (requests: Request[]): string[] =>
  requests.map((request) => request.headers['X-Inertia-Partial-Data'])

export const orders: LiveChannel = { name: 'orders.1', type: 'private' }
export const reports: LiveChannel = { name: 'reports', type: 'public' }
export const stats: LiveChannel = { name: 'stats', type: 'public' }

export const listeners = (channel: LiveChannel, ...events: string[]): LiveProp => ({
  listeners: [{ channel, events }],
})

export const withEvent = (event: string, extra: Record<string, unknown> = {}) => ({
  __inertia: { event, ...extra },
})
