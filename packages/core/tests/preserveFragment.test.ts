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

import { router } from '../src'
import { page as currentPage } from '../src/page'
import { prefetchedRequests } from '../src/prefetched'
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

const redirectHttpResponse = (location: string): HttpResponse => ({
  status: 409,
  headers: { 'x-inertia-redirect': location },
  data: '',
})

const bootPage = (page: Page): Page => {
  window.location.href = new URL(page.url, 'http://localhost').href
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
    const syncHistoryUrl = (_state: unknown, _unused: string, url?: string | URL | null) => {
      if (url != null) {
        window.location.href = new URL(url.toString(), window.location.href).href
      }
    }
    window.history.replaceState = syncHistoryUrl
    window.history.pushState = syncHistoryUrl
    ;(document as unknown as { getElementById: () => null }).getElementById = () => null
  })

  afterEach(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0))
    prefetchedRequests.removeAll()
    vi.restoreAllMocks()
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
    await currentPage.set(ordersPage({ url: '/orders' }), { replace: true })

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

  it('does not leak the fragment to cross-origin X-Inertia-Location redirects', async () => {
    const initial = bootPage(ordersPage({ url: '/orders#secret-drawer' }))

    const visit = makeVisit({
      url: new URL('http://localhost/checkout'),
      preserveFragment: true,
    })
    const response = Response.create(
      RequestParams.create(visit),
      locationHttpResponse('https://external.example/checkout'),
      initial,
    )

    await response.process()

    expect(window.location.href).toBe('https://external.example/checkout')
  })

  it('preserves a fragment updated directly on window.location.hash even when currentPage.url has no hash or a stale hash', async () => {
    const initial = bootPage(ordersPage({ url: '/orders#stale' }))
    window.location.href = 'http://localhost/orders#native-anchor'

    const visit = makeVisit({
      url: new URL('http://localhost/orders?status=open'),
      preserveFragment: true,
    })
    const responsePage = ordersPage({ url: '/orders?status=open' })
    const response = Response.create(RequestParams.create(visit), inertiaHttpResponse(responsePage), initial)

    await response.process()

    expect(currentPage.get().url).toBe('/orders?status=open#native-anchor')
  })

  it('does not resurrect a stale currentPage.url hash when window.location.hash is cleared directly', async () => {
    const initial = bootPage(ordersPage({ url: '/orders#stale' }))
    window.location.href = 'http://localhost/orders'

    const visit = makeVisit({
      url: new URL('http://localhost/orders?status=open'),
      preserveFragment: true,
    })
    const responsePage = ordersPage({ url: '/orders?status=open' })
    const response = Response.create(RequestParams.create(visit), inertiaHttpResponse(responsePage), initial)

    await response.process()

    expect(currentPage.get().url).toBe('/orders?status=open')
  })

  it('does not poison a reused cached prefetch response with an earlier preserved fragment', async () => {
    const initial = bootPage(ordersPage({ url: '/orders#42' }))
    const responsePage = ordersPage({ url: '/orders?status=open' })
    const cachedResponse = Response.create(
      RequestParams.create(
        makeVisit({
          url: new URL('http://localhost/orders?status=open'),
          prefetch: true,
          preserveFragment: false,
        }),
      ),
      inertiaHttpResponse(responsePage),
      initial,
    )

    // First consumption while #42 is active
    cachedResponse.mergeParams(
      makeVisit({
        url: new URL('http://localhost/orders?status=open'),
        cached: true,
        preserveFragment: true,
      }),
    )
    await cachedResponse.handle()
    expect(currentPage.get().url).toBe('/orders?status=open#42')

    // Second consumption after the user switched to #99
    await currentPage.set(ordersPage({ url: '/orders#99' }), { replace: true })
    cachedResponse.mergeParams(
      makeVisit({
        url: new URL('http://localhost/orders?status=open'),
        cached: true,
        preserveFragment: true,
      }),
    )
    await cachedResponse.handle()
    expect(currentPage.get().url).toBe('/orders?status=open#99')

    // Third consumption with preserveFragment: false should not carry over #99
    cachedResponse.mergeParams(
      makeVisit({
        url: new URL('http://localhost/orders?status=open'),
        cached: true,
        preserveFragment: false,
      }),
    )
    await cachedResponse.handle()
    expect(currentPage.get().url).toBe('/orders?status=open')
  })

  it('preserves fragments across same-origin 409 X-Inertia-Redirect responses without snapshotting live hashes or leaking cross-origin', async () => {
    const initial = bootPage(ordersPage({ url: '/orders#42' }))
    const visitSpy = vi.spyOn(router, 'visit').mockImplementation(() => {})

    const explicitHashResponse = Response.create(
      RequestParams.create(
        makeVisit({
          url: new URL('http://localhost/old#target'),
          preserveFragment: true,
        }),
      ),
      redirectHttpResponse('http://localhost/new'),
      initial,
    )

    await explicitHashResponse.process()

    expect(visitSpy).toHaveBeenCalledTimes(1)
    expect((visitSpy.mock.calls[0][0] as URL).href).toBe('http://localhost/new#target')
    expect(visitSpy.mock.calls[0][1]).toMatchObject({ preserveFragment: true })

    visitSpy.mockClear()

    // Live fragment (#42) should not be baked into redirectUrl early so clearing it mid-flight still works
    const liveHashResponse = Response.create(
      RequestParams.create(
        makeVisit({
          url: new URL('http://localhost/old'),
          preserveFragment: true,
        }),
      ),
      redirectHttpResponse('http://localhost/new'),
      initial,
    )

    await liveHashResponse.process()

    expect(visitSpy).toHaveBeenCalledTimes(1)
    expect((visitSpy.mock.calls[0][0] as URL).href).toBe('http://localhost/new')
    expect(visitSpy.mock.calls[0][1]).toMatchObject({ preserveFragment: true })

    visitSpy.mockClear()

    const crossOriginResponse = Response.create(
      RequestParams.create(
        makeVisit({
          url: new URL('http://localhost/old#target'),
          preserveFragment: true,
        }),
      ),
      redirectHttpResponse('https://external.example/new'),
      initial,
    )

    await crossOriginResponse.process()

    expect(visitSpy).toHaveBeenCalledTimes(1)
    expect((visitSpy.mock.calls[0][0] as URL).href).toBe('https://external.example/new')
    expect(visitSpy.mock.calls[0][1]).toMatchObject({ preserveFragment: false })
  })

  it('preserves the fragment during instant visit intermediate swaps', async () => {
    bootPage(ordersPage({ url: '/orders#42' }))

    const visit = makeVisit({
      url: new URL('http://localhost/orders?status=open'),
      component: 'Orders/Index',
      preserveFragment: true,
    })

    await (
      router as unknown as {
        performInstantSwap: (pendingVisit: ActiveVisit) => Promise<void>
      }
    ).performInstantSwap(visit)

    expect(currentPage.get().url).toBe('/orders?status=open#42')
  })

  it('does not snapshot the starting hash into router.reload when preserveFragment is true', () => {
    bootPage(ordersPage({ url: '/orders#42' }))
    window.location.href = 'http://localhost/orders#42'
    const visitSpy = vi.spyOn(router, 'visit').mockImplementation(() => {})

    router.reload({ preserveFragment: true })

    expect(visitSpy).toHaveBeenCalledTimes(1)
    expect((visitSpy.mock.calls[0][0] as URL).href).toBe('http://localhost/orders')
    expect(visitSpy.mock.calls[0][1]).toMatchObject({ preserveFragment: true })

    visitSpy.mockClear()

    router.reload()

    expect(visitSpy).toHaveBeenCalledTimes(1)
    expect(visitSpy.mock.calls[0][0]).toBe('http://localhost/orders#42')
  })

  it('reuses a prefetched response regardless of preserveFragment differences', async () => {
    const initial = bootPage(ordersPage({ url: '/orders#42' }))
    const prefetchVisit = makeVisit({
      id: 'prefetch-1',
      url: new URL('http://localhost/orders?status=open'),
      prefetch: true,
      preserveFragment: false,
    })

    await prefetchedRequests.add(
      prefetchVisit,
      (params) => {
        const response = Response.create(
          RequestParams.create(params),
          inertiaHttpResponse(ordersPage({ url: '/orders?status=open' })),
          initial,
        )
        params.onPrefetchResponse?.(response)
      },
      { cacheFor: 30_000, cacheTags: [] },
    )

    const cached = prefetchedRequests.findCached(
      makeVisit({
        id: 'visit-2',
        url: new URL('http://localhost/orders?status=open'),
        preserveFragment: true,
      }),
    )

    expect(cached).not.toBeNull()
  })
})
