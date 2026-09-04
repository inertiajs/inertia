import { beforeEach, describe, expect, it, vi } from 'vitest'
import { historySessionStorageKeys } from '../src/encryption'
import { http } from '../src/http'
import { page as currentPage } from '../src/page'
import { prefetchedRequests } from '../src/prefetched'
import { Response } from '../src/response'
import { Router } from '../src/router'
import { BaseSnapshot, Page } from '../src/types'

const pageWith = (overrides: Partial<Page> = {}): Page =>
  ({
    component: 'Users/Index',
    props: { users: [] },
    url: '/users',
    version: null,
    rescuedProps: [],
    flash: {},
    rememberedState: {},
    ...overrides,
  }) as Page

const hold = async (page: Page): Promise<Page> => {
  currentPage.init({
    initialPage: page,
    resolveComponent: (name) => ({ name }) as never,
    swapComponent: async () => {},
  })

  await currentPage.setQuietly(page)

  return page
}

beforeEach(() => {
  http.setClient({ request: () => new Promise(() => {}) })
  prefetchedRequests.removeAll()
})

const respondWith = (page: Page) =>
  http.setClient({
    request: async () => ({ status: 200, data: page as unknown as string, headers: { 'x-inertia': 'true' } }),
  })

const capturesOf = (router: Router): BaseSnapshot[] =>
  (
    router as unknown as { syncRequestStream: { requests: { capturedBase: BaseSnapshot }[] } }
  ).syncRequestStream.requests.map((request) => request.capturedBase)

const cached = () => (prefetchedRequests as unknown as { cached: { response: Promise<Response> }[] }).cached

const capturedBaseOf = (response: Response): BaseSnapshot =>
  (response as unknown as { capturedBase: BaseSnapshot }).capturedBase

const dispatched = async (router: Router): Promise<BaseSnapshot> => {
  await vi.waitFor(() => expect(capturesOf(router)).toHaveLength(1))

  return capturesOf(router)[0]
}

describe('the base a visit is dispatched from', () => {
  it('is the page on screen', async () => {
    const base = await hold(pageWith())
    const generation = currentPage.generation()
    const router = new Router()

    router.visit('http://localhost/users/5')

    expect(await dispatched(router)).toEqual({ page: base, generation })
  })

  it('is the base before an instant swap replaces it', async () => {
    const base = await hold(pageWith())
    const generation = currentPage.generation()
    const router = new Router()

    router.visit('http://localhost/users/5', { component: 'Users/Show' })

    const captured = await dispatched(router)

    expect(currentPage.get()).not.toBe(base)
    expect(currentPage.generation()).not.toBe(generation)
    expect(captured).toEqual({ page: base, generation })
  })

  it('is the page on screen when a prefetched response is replayed, not the one it was prefetched from', async () => {
    await hold(pageWith())
    respondWith(pageWith({ component: 'Users/Show', url: '/users/5' }))
    const router = new Router()

    router.prefetch('http://localhost/users/5', {}, { cacheFor: '30s' })

    await vi.waitFor(() => expect(cached()).toHaveLength(1))
    const prefetched = await cached()[0].response

    const moved = pageWith({ component: 'Users/Archive', url: '/users/archive' })
    await currentPage.setQuietly(moved)
    const generation = currentPage.generation()

    router.visit('http://localhost/users/5')

    await vi.waitFor(() => expect(capturedBaseOf(prefetched)).toEqual({ page: moved, generation }))
  })

  it('is the base before an instant swap when the response was prefetched', async () => {
    await hold(pageWith())
    respondWith(pageWith({ component: 'Users/Show', url: '/users/5' }))
    const router = new Router()

    router.prefetch('http://localhost/users/5', {}, { cacheFor: '30s' })

    await vi.waitFor(() => expect(cached()).toHaveLength(1))
    const prefetched = await cached()[0].response

    const moved = pageWith({ component: 'Users/Archive', url: '/users/archive' })
    await currentPage.setQuietly(moved)
    const generation = currentPage.generation()

    router.visit('http://localhost/users/5', { component: 'Users/Show' })

    await vi.waitFor(() => expect(capturedBaseOf(prefetched)).toEqual({ page: moved, generation }))
  })
})

describe('clearing history', () => {
  const seedKeys = () => {
    window.sessionStorage.setItem(historySessionStorageKeys.key, '[1,2,3]')
    window.sessionStorage.setItem(historySessionStorageKeys.iv, '[4,5,6]')
  }

  const keysHeld = () => window.sessionStorage.getItem(historySessionStorageKeys.key) !== null

  const logoutPage = (): Page => pageWith({ component: 'Auth/Logout', url: '/logout', clearHistory: true })

  const settled = () => new Promise((resolve) => setTimeout(resolve))

  it('discards the keys when the page asks', async () => {
    await hold(pageWith())
    seedKeys()

    await currentPage.set(logoutPage())

    expect(keysHeld()).toBe(false)
  })

  it('keeps them when the page does not ask', async () => {
    await hold(pageWith())
    seedKeys()

    await currentPage.set(pageWith({ component: 'Users/Show', url: '/users/5' }))

    expect(keysHeld()).toBe(true)
  })

  it('leaves no pending request on the entry it writes', async () => {
    await hold(pageWith())
    const pushState = vi.spyOn(window.history, 'pushState')

    await currentPage.set(logoutPage())

    expect(pushState.mock.lastCall![0].page.clearHistory).toBe(false)

    pushState.mockRestore()
  })

  it('does not discard them again when a client visit rewrites the page', async () => {
    await hold(pageWith())
    await currentPage.set(logoutPage())
    await settled()
    seedKeys()

    await new Promise<void>((resolve) => {
      new Router().replace({ props: { users: [{ id: 1 }] }, onSuccess: () => resolve() })
    })

    expect(keysHeld()).toBe(true)
  })

  it('still asks when a cached prefetch is replayed a second time', async () => {
    await hold(pageWith())

    let requests = 0

    http.setClient({
      request: async () => {
        requests++

        return { status: 200, data: logoutPage() as unknown as string, headers: { 'x-inertia': 'true' } }
      },
    })

    const router = new Router()
    router.prefetch('http://localhost/logout', {}, { cacheFor: '30s' })
    await vi.waitFor(() => expect(requests).toBe(1))

    const visit = () =>
      new Promise<void>((resolve) => router.visit('http://localhost/logout', { onSuccess: () => resolve() }))

    await visit()
    seedKeys()
    await visit()

    expect(requests).toBe(1)
    expect(keysHeld()).toBe(false)
  })
})
