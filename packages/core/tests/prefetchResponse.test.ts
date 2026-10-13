import { beforeEach, describe, expect, it, vi } from 'vitest'
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
