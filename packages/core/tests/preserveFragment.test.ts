import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ordersPage, stubBrowser } from './liveHarness'

// `history.ts` evaluates `isServer = typeof window === 'undefined'` at import time.
vi.hoisted(() => {
  if (typeof window === 'undefined') {
    ;(globalThis as Record<string, unknown>).window = {
      location: new URL('http://localhost/orders'),
      navigator: { userAgent: 'node' },
      history: {
        state: {},
        scrollRestoration: 'auto',
        replaceState: () => {},
        pushState: () => {},
      },
    }
  }
})

import { page as currentPage } from '../src/page'
import { RequestParams } from '../src/requestParams'
import { Response } from '../src/response'
import type { ActiveVisit, HttpResponse, Page } from '../src/types'

const makeVisit = (overrides: Partial<ActiveVisit> = {}): ActiveVisit =>
  ({
    id: 'visit-1',
    url: new URL('http://localhost/orders?status=open'),
    method: 'get',
    data: {},
    replace: false,
    preserveScroll: false,
    preserveState: false,
    preserveUrl: false,
    preserveFragment: false,
    preserveErrors: false,
    only: [],
    except: [],
    reset: [],
    headers: {},
    errorBag: '',
    forceFormData: false,
    queryStringArrayFormat: 'brackets',
    async: false,
    showProgress: true,
    prefetch: false,
    fresh: false,
    invalidateCacheTags: [],
    viewTransition: false,
    component: null,
    pageProps: null,
    cached: false,
    cancelled: false,
    completed: false,
    interrupted: false,
    onCancelToken: () => {},
    onBefore: () => true,
    onBeforeUpdate: () => {},
    onStart: () => {},
    onProgress: () => {},
    onFinish: () => {},
    onCancel: () => {},
    onSuccess: () => {},
    onError: () => {},
    onFlash: () => {},
    onPrefetched: () => {},
    onPrefetching: () => {},
    onHttpException: () => {},
    onNetworkError: () => {},
    ...overrides,
  }) as ActiveVisit

const inertiaHttpResponse = (page: Page): HttpResponse => ({
  status: 200,
  headers: { 'x-inertia': 'true' },
  data: JSON.stringify(page),
})

const locationHttpResponse = (location: string): HttpResponse => ({
  status: 409,
  headers: { 'x-inertia-location': location },
  data: '',
})

const bootPage = (page: Page): Page => {
  currentPage.init({
    initialPage: page,
    resolveComponent: () => ({}),
    swapComponent: () => Promise.resolve(),
  })

  return page
}

describe('preserveFragment visit option', () => {
  beforeEach(() => {
    stubBrowser()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('preserves the current page fragment across query-string changes when preserveFragment is true', async () => {
    const initial = bootPage(ordersPage({ url: '/orders#42' }))

    const visit = makeVisit({
      url: new URL('http://localhost/orders?status=open'),
      preserveFragment: true,
    })
    const responsePage = ordersPage({ url: '/orders?status=open' })
    const response = Response.create(RequestParams.create(visit), inertiaHttpResponse(responsePage), initial)

    await response.process()

    expect(currentPage.get().url).toBe('/orders?status=open#42')
  })

  it('preserves the current page fragment across redirects when preserveFragment is true', async () => {
    const initial = bootPage(ordersPage({ url: '/orders?perPage=999#42' }))

    const visit = makeVisit({
      url: new URL('http://localhost/orders?perPage=999'),
      preserveFragment: true,
    })
    const responsePage = ordersPage({ url: '/orders?perPage=250' })
    const response = Response.create(RequestParams.create(visit), inertiaHttpResponse(responsePage), initial)

    await response.process()

    expect(currentPage.get().url).toBe('/orders?perPage=250#42')
  })

  it('prefers an explicit request fragment over the current page fragment', async () => {
    const initial = bootPage(ordersPage({ url: '/orders#42' }))

    const visit = makeVisit({
      url: new URL('http://localhost/orders?status=open#99'),
      preserveFragment: true,
    })
    const responsePage = ordersPage({ url: '/orders?status=open' })
    const response = Response.create(RequestParams.create(visit), inertiaHttpResponse(responsePage), initial)

    await response.process()

    expect(currentPage.get().url).toBe('/orders?status=open#99')
  })

  it('respects an explicit fragment returned by the server response', async () => {
    const initial = bootPage(ordersPage({ url: '/orders#42' }))

    const visit = makeVisit({
      url: new URL('http://localhost/orders?status=open#99'),
      preserveFragment: true,
    })
    const responsePage = ordersPage({ url: '/orders?status=open#server-anchor' })
    const response = Response.create(RequestParams.create(visit), inertiaHttpResponse(responsePage), initial)

    await response.process()

    expect(currentPage.get().url).toBe('/orders?status=open#server-anchor')
  })

  it('does not resurrect a fragment that was cleared on the current page while the visit was in flight', async () => {
    const initial = bootPage(ordersPage({ url: '/orders#42' }))

    const visit = makeVisit({
      url: new URL('http://localhost/orders?status=open'),
      preserveFragment: true,
    })
    const responsePage = ordersPage({ url: '/orders?status=open' })
    const response = Response.create(RequestParams.create(visit), inertiaHttpResponse(responsePage), initial)

    // User closes the drawer before the filter response lands.
    await currentPage.setQuietly(ordersPage({ url: '/orders' }))

    await response.process()

    expect(currentPage.get().url).toBe('/orders?status=open')
  })

  it('does not preserve the current page fragment when preserveFragment is false', async () => {
    const initial = bootPage(ordersPage({ url: '/orders#42' }))

    const visit = makeVisit({
      url: new URL('http://localhost/orders?status=open'),
      preserveFragment: false,
    })
    const responsePage = ordersPage({ url: '/orders?status=open' })
    const response = Response.create(RequestParams.create(visit), inertiaHttpResponse(responsePage), initial)

    await response.process()

    expect(currentPage.get().url).toBe('/orders?status=open')
  })

  it('keeps existing server-side pageResponse.preserveFragment behavior unchanged', async () => {
    const initial = bootPage(ordersPage({ url: '/orders#old' }))

    const visit = makeVisit({
      url: new URL('http://localhost/redirect#from-link'),
      preserveFragment: false,
    })
    const responsePage = ordersPage({ url: '/target', preserveFragment: true })
    const response = Response.create(RequestParams.create(visit), inertiaHttpResponse(responsePage), initial)

    await response.process()

    expect(currentPage.get().url).toBe('/target#from-link')
  })

  it('preserves the fragment on X-Inertia-Location visits when preserveFragment is true', async () => {
    const initial = bootPage(ordersPage({ url: '/orders#42' }))

    const visit = makeVisit({
      url: new URL('http://localhost/orders?status=open'),
      preserveFragment: true,
    })
    const response = Response.create(
      RequestParams.create(visit),
      locationHttpResponse('http://localhost/orders?status=open'),
      initial,
    )

    await response.process()

    expect(window.location.href).toBe('http://localhost/orders?status=open#42')
  })
})
