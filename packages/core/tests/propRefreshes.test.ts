import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { visitRefreshesProp } from '../src/partialReload'
import { propRefreshes, trackPendingDeferredProps, trackPropRefresh, untrackPropRefresh } from '../src/propRefreshes'
import type { ActiveVisit, InternalActiveVisit, Page } from '../src/types'

const filter = (only: string[] = [], except: string[] = [], reset: string[] = []) => ({ only, except, reset })

const makeVisit = (overrides: Partial<ActiveVisit> = {}): ActiveVisit =>
  ({
    id: 'visit-1',
    url: new URL('http://localhost/users'),
    only: [],
    except: [],
    reset: [],
    prefetch: false,
    ...overrides,
  }) as ActiveVisit

describe('visitRefreshesProp', () => {
  it('refreshes every prop when the visit has no filters', () => {
    expect(visitRefreshesProp(filter(), 'users')).toBe(true)
    expect(visitRefreshesProp(filter(), 'users.data.0.name')).toBe(true)
  })

  it('matches the requested paths and their descendants', () => {
    expect(visitRefreshesProp(filter(['users']), 'users')).toBe(true)
    expect(visitRefreshesProp(filter(['users']), 'users.data')).toBe(true)
    expect(visitRefreshesProp(filter(['users']), 'stats')).toBe(false)
    expect(visitRefreshesProp(filter(['users']), 'usersCount')).toBe(false)
  })

  it('matches ancestors of the requested paths, since part of them is refreshed', () => {
    expect(visitRefreshesProp(filter(['user.name']), 'user')).toBe(true)
    expect(visitRefreshesProp(filter(['user.name']), 'user.name')).toBe(true)
    expect(visitRefreshesProp(filter(['user.name']), 'user.email')).toBe(false)
  })

  it('treats reset paths as requested, since they are sent as partial data', () => {
    expect(visitRefreshesProp(filter([], [], ['users']), 'users')).toBe(true)
    expect(visitRefreshesProp(filter([], [], ['users']), 'stats')).toBe(false)
    expect(visitRefreshesProp(filter(['stats'], [], ['users']), 'users')).toBe(true)
    expect(visitRefreshesProp(filter(['stats'], [], ['users']), 'stats')).toBe(true)
  })

  it('excludes the excepted paths and their descendants', () => {
    expect(visitRefreshesProp(filter([], ['users']), 'users')).toBe(false)
    expect(visitRefreshesProp(filter([], ['users']), 'users.data')).toBe(false)
    expect(visitRefreshesProp(filter([], ['users']), 'stats')).toBe(true)
    expect(visitRefreshesProp(filter([], ['user.email']), 'user')).toBe(true)
    expect(visitRefreshesProp(filter([], ['user.email']), 'user.email')).toBe(false)
  })
})

describe('propRefreshes', () => {
  beforeEach(() => {
    vi.stubGlobal('window', { location: new URL('http://localhost/users') })
  })

  afterEach(() => {
    trackPendingDeferredProps({ props: {} } as Page, undefined)
    untrackPropRefresh(makeVisit({ id: 'visit-1' }))
    untrackPropRefresh(makeVisit({ id: 'visit-2' }))
    vi.unstubAllGlobals()
  })

  it('tracks the props of in-flight requests', () => {
    expect(propRefreshes.isRefreshing('users')).toBe(false)

    trackPropRefresh(makeVisit({ only: ['users'] }))

    expect(propRefreshes.isRefreshing('users')).toBe(true)
    expect(propRefreshes.isRefreshing('stats')).toBe(false)

    untrackPropRefresh(makeVisit({ only: ['users'] }))

    expect(propRefreshes.isRefreshing('users')).toBe(false)
  })

  it('keeps a prop refreshing until every request claiming it has finished', () => {
    trackPropRefresh(makeVisit({ id: 'visit-1', only: ['users'] }))
    trackPropRefresh(makeVisit({ id: 'visit-2', only: ['users', 'stats'] }))

    untrackPropRefresh(makeVisit({ id: 'visit-1' }))

    expect(propRefreshes.isRefreshing('users')).toBe(true)

    untrackPropRefresh(makeVisit({ id: 'visit-2' }))

    expect(propRefreshes.isRefreshing('users')).toBe(false)
  })

  it('ignores prefetches and requests aimed at another page', () => {
    trackPropRefresh(makeVisit({ id: 'visit-1', prefetch: true }))
    trackPropRefresh(makeVisit({ id: 'visit-2', url: new URL('http://localhost/organizations') }))

    expect(propRefreshes.isRefreshing('users')).toBe(false)
  })

  it('ignores a request it never tracked, so untracking twice is safe', () => {
    const listener = vi.fn()
    const unsubscribe = propRefreshes.onChange(listener)

    untrackPropRefresh(makeVisit())

    expect(listener).not.toHaveBeenCalled()

    trackPropRefresh(makeVisit())
    untrackPropRefresh(makeVisit())
    untrackPropRefresh(makeVisit())

    expect(listener).toHaveBeenCalledTimes(2)
    expect(propRefreshes.isRefreshing('users')).toBe(false)

    unsubscribe()
  })

  it('notifies listeners when the tracked state changes', () => {
    const listener = vi.fn()
    const unsubscribe = propRefreshes.onChange(listener)

    trackPropRefresh(makeVisit())
    untrackPropRefresh(makeVisit())

    expect(listener).toHaveBeenCalledTimes(2)

    unsubscribe()
    trackPropRefresh(makeVisit())

    expect(listener).toHaveBeenCalledTimes(2)
  })

  it('counts deferred props still missing from the page as refreshing until their request starts', () => {
    trackPendingDeferredProps({ props: { users: ['John'] } } as unknown as Page, {
      default: ['users', 'stats'],
      other: ['user.name'],
    })

    expect(propRefreshes.isRefreshing('users')).toBe(false)
    expect(propRefreshes.isRefreshing('stats')).toBe(true)
    expect(propRefreshes.isRefreshing('user')).toBe(true)

    trackPropRefresh({ ...makeVisit({ only: ['stats'] }), deferredProps: true } as InternalActiveVisit)

    expect(propRefreshes.isRefreshing('stats')).toBe(true)
    expect(propRefreshes.isRefreshing('user')).toBe(false)

    untrackPropRefresh(makeVisit())

    expect(propRefreshes.isRefreshing('stats')).toBe(false)
  })

  it('forgets pending deferred props once a page that loads none takes over', () => {
    trackPendingDeferredProps({ props: {} } as Page, { default: ['stats'] })
    trackPendingDeferredProps({ props: {} } as Page, undefined)

    expect(propRefreshes.isRefreshing('stats')).toBe(false)
  })
})
