import { beforeEach, describe, expect, it, vi } from 'vitest'
import { router } from '../src'
import { history } from '../src/history'
import { page as currentPage } from '../src/page'
import { Response } from '../src/response'
import type { HttpResponse, Page } from '../src/types'

const makePage = (component: string): Page => ({ component, props: {}, url: '/users', version: '1' }) as Page

const makeResponse = (overrides: Partial<HttpResponse> = {}): HttpResponse =>
  ({ status: 200, data: makePage('Users'), headers: { 'x-inertia': 'true' }, ...overrides }) as HttpResponse

function prefetchResponse(response: HttpResponse) {
  const params = { all: () => ({ url: new URL('http://localhost/users') }) }
  const instance = Response.create(params as any, response, makePage('Users'))
  const handle = vi.spyOn(instance, 'handle').mockResolvedValue(undefined)

  return { instance, handle }
}

describe('Response.handlePrefetch', () => {
  beforeEach(() => {
    vi.stubGlobal('window', { location: new URL('http://localhost/users') })
    vi.spyOn(currentPage, 'get').mockReturnValue(makePage('Users'))
  })

  it('applies a plain Inertia response for the current component', async () => {
    const { instance, handle } = prefetchResponse(makeResponse())

    await instance.handlePrefetch()

    expect(handle).toHaveBeenCalledTimes(1)
  })

  it('does not navigate when the prefetch resolves to a different component (e.g. login)', async () => {
    const { instance, handle } = prefetchResponse(makeResponse({ data: makePage('Auth/Login') }))

    await instance.handlePrefetch()

    expect(handle).not.toHaveBeenCalled()
  })

  it('does not perform a location visit for a 409 response', async () => {
    const { instance, handle } = prefetchResponse(
      makeResponse({ status: 409, headers: { 'x-inertia-location': 'http://localhost/login' } }),
    )

    await instance.handlePrefetch()

    expect(handle).not.toHaveBeenCalled()
  })

  it('does not apply a non-Inertia response', async () => {
    const { instance, handle } = prefetchResponse(makeResponse({ data: '<html></html>', headers: {} }))

    await instance.handlePrefetch()

    expect(handle).not.toHaveBeenCalled()
  })

  it('does not apply an error response', async () => {
    const { instance, handle } = prefetchResponse(makeResponse({ status: 500 }))

    await instance.handlePrefetch()

    expect(handle).not.toHaveBeenCalled()
  })

  it('ignores prefetches for a different URL', async () => {
    const params = { all: () => ({ url: new URL('http://localhost/other') }) }
    const instance = Response.create(params as any, makeResponse(), makePage('Users'))
    const handle = vi.spyOn(instance, 'handle').mockResolvedValue(undefined)

    await instance.handlePrefetch()

    expect(handle).not.toHaveBeenCalled()
  })
})

describe('Response.handlePrefetch with the real handle', () => {
  const makeParams = (prefetch: boolean) => {
    const visit = {
      url: new URL('http://localhost/users'),
      prefetch,
      id: 'visit-1',
      replace: false,
      preserveUrl: false,
      preserveScroll: false,
      preserveState: false,
      onPrefetched: vi.fn(),
      onSuccess: vi.fn(),
      onFlash: vi.fn(),
      onError: vi.fn(),
      onBeforeUpdate: vi.fn(),
      onHttpException: vi.fn(),
    }

    return {
      visit,
      params: {
        all: () => visit,
        runCallbacks: vi.fn(),
        isDeferredPropsRequest: () => false,
        setPreserveOptions: vi.fn(),
        isPartial: () => false,
      },
    }
  }

  let setPage: ReturnType<typeof vi.spyOn>
  let visit: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.restoreAllMocks()
    vi.stubGlobal('window', { location: new URL('http://localhost/users') })
    vi.stubGlobal('document', { dispatchEvent: vi.fn().mockReturnValue(true) })
    vi.spyOn(currentPage, 'get').mockReturnValue({ ...makePage('Users'), flash: {} } as Page)
    vi.spyOn(currentPage, 'mergeOncePropsIntoResponse').mockImplementation(() => {})
    vi.spyOn(history, 'processQueue').mockResolvedValue(undefined)
    vi.spyOn(router, 'flush').mockImplementation(() => {})
    vi.spyOn(router, 'flushByCacheTags').mockImplementation(() => {})
    setPage = vi.spyOn(currentPage, 'set').mockResolvedValue(undefined)
    visit = vi.spyOn(router, 'visit').mockImplementation(() => {})
  })

  it('applies the page through the real handle once a visit has taken over the prefetch', async () => {
    const { params, visit: v } = makeParams(false)
    const instance = Response.create(params as any, makeResponse(), makePage('Users'))
    vi.spyOn(instance as any, 'setRememberedState').mockResolvedValue(undefined)

    await instance.handlePrefetch()
    await vi.waitFor(() => expect(v.onSuccess).toHaveBeenCalledTimes(1))

    expect(setPage).toHaveBeenCalledTimes(1)
  })

  it('does not touch the current page or navigate when the real response is a redirect to login', async () => {
    const { params, visit: v } = makeParams(false)
    const instance = Response.create(params as any, makeResponse({ data: makePage('Auth/Login') }), makePage('Users'))

    await instance.handlePrefetch()
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(setPage).not.toHaveBeenCalled()
    expect(visit).not.toHaveBeenCalled()
    expect(v.onSuccess).not.toHaveBeenCalled()
  })

  it('does not follow an Inertia redirect or location visit', async () => {
    const { params } = makeParams(false)
    const instance = Response.create(
      params as any,
      makeResponse({ status: 409, data: '', headers: { 'x-inertia-redirect': 'http://localhost/login' } }),
      makePage('Users'),
    )

    await instance.handlePrefetch()
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(visit).not.toHaveBeenCalled()
    expect(setPage).not.toHaveBeenCalled()
  })

  it('only fires onPrefetched for a still-pending prefetch', async () => {
    const { params, visit: v } = makeParams(true)
    const instance = Response.create(params as any, makeResponse(), makePage('Users'))

    await instance.handlePrefetch()
    await vi.waitFor(() => expect(v.onPrefetched).toHaveBeenCalledTimes(1))

    expect(setPage).not.toHaveBeenCalled()
    expect(v.onSuccess).not.toHaveBeenCalled()
  })
})
