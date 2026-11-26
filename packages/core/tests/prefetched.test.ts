import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { prefetchedRequests } from '../src/prefetched'
import type { ActiveVisit, InternalActiveVisit } from '../src/types'

const day = 24 * 60 * 60 * 1000

const makeVisit = (): ActiveVisit =>
  ({
    id: 'visit-1',
    url: new URL('http://localhost/users'),
    method: 'get',
    data: {},
    headers: {},
    only: [],
    except: [],
    reset: [],
    prefetch: true,
    onCancel: () => {},
    onError: () => {},
    onPrefetching: () => {},
    onPrefetched: () => {},
  }) as unknown as ActiveVisit

const prefetch = (params: ActiveVisit, cacheFor: string | number) =>
  prefetchedRequests.add(
    params,
    (visit: InternalActiveVisit) => {
      visit.onPrefetchResponse!({
        getPageResponse: () => ({ component: 'Users', props: {}, url: '/users', version: null }),
        handlePrefetch: () => {},
      } as any)
    },
    { cacheFor, cacheTags: [] },
  )

describe('prefetch cache', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.stubGlobal('window', {
      setTimeout: (...args: Parameters<typeof setTimeout>) => setTimeout(...args),
      clearTimeout: (id: ReturnType<typeof setTimeout>) => clearTimeout(id),
    })
  })

  afterEach(() => {
    prefetchedRequests.removeAll()
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('keeps a response cached for longer than the max timer delay', async () => {
    const params = makeVisit()

    await prefetch(params, '30d')

    vi.advanceTimersByTime(1000)
    expect(prefetchedRequests.findCached(params)).not.toBeNull()

    vi.advanceTimersByTime(29 * day)
    expect(prefetchedRequests.findCached(params)).not.toBeNull()

    vi.advanceTimersByTime(day)
    expect(prefetchedRequests.findCached(params)).toBeNull()
  })

  it('removes a short-lived response when it expires', async () => {
    const params = makeVisit()

    await prefetch(params, '1m')

    vi.advanceTimersByTime(59_000)
    expect(prefetchedRequests.findCached(params)).not.toBeNull()

    vi.advanceTimersByTime(1000)
    expect(prefetchedRequests.findCached(params)).toBeNull()
  })
})
