import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ActiveVisit, LiveChannel, LiveEventHandler, LiveProp, Page } from '../src/types'

const orders: LiveChannel = { name: 'orders.1', type: 'private' }
const reports: LiveChannel = { name: 'reports', type: 'public' }

const listeners = (channel: LiveChannel, event: string): LiveProp => ({
  listeners: [{ channel, events: [event] }],
})

type Request = { url: string; headers: Record<string, string> }

/**
 * Enough of a browser for the real router to run in Node. Requests never
 * resolve, which is what makes them observable: an issued reload stays in
 * flight, exactly as it would while a payload for the same prop arrives.
 */
const stubBrowser = (): Request[] => {
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

const setup = async (liveProps: Record<string, LiveProp>, page: Partial<Page> = {}) => {
  const requests = stubBrowser()

  const { router } = await import('../src/index')
  const { configureLive } = await import('../src/live')
  const { page: currentPage } = await import('../src/page')
  const { trackPropRefresh, untrackPropRefresh } = await import('../src/propRefreshes')

  const handlers = new Map<string, LiveEventHandler>()
  let swaps = 0

  router.init({
    initialPage: {
      component: 'Orders',
      url: '/orders',
      version: '1',
      props: {
        order: { id: 1, total: '1.00' },
        stats: { count: 1 },
        activity: ['created'],
        unrelated: 'untouched',
      },
      flash: {},
      liveProps,
      rememberedState: {},
      rescuedProps: [],
      clearHistory: false,
      encryptHistory: false,
      ...page,
    } as Page,
    swapComponent: () => {
      swaps++
      return Promise.resolve()
    },
    resolveComponent: (name) => name,
  })

  configureLive({
    transport: {
      subscribe: (channel, event, handler) => {
        handlers.set(`${channel.name}::${event}`, handler)
        return () => {}
      },
    },
    throttle: 0,
    pauseWhenHidden: false,
  })

  const visit = (only: string[]): ActiveVisit =>
    ({ id: 'refresh', url: new URL('http://localhost/orders'), only, except: [], reset: [] }) as ActiveVisit

  const settle = () => new Promise((resolve) => setTimeout(resolve, 80))

  // The initial visit swaps and fetches deferred props of its own accord. Let
  // it finish, so everything counted below belongs to the broadcast.
  await settle()

  swaps = 0
  requests.length = 0

  return {
    emit: (channel: LiveChannel, event: string, payload: unknown) =>
      handlers.get(`${channel.name}::${event}`)!(payload),
    settle,
    props: () => currentPage.get().props,
    flash: () => currentPage.get().flash,
    liveProps: () => currentPage.get().liveProps,
    scrollProps: () => currentPage.get().scrollProps,
    writes: () => swaps,
    requests: () => requests,
    reloaded: () => requests.map((request) => request.headers['X-Inertia-Partial-Data']),
    startRefreshing: (only: string[]) => trackPropRefresh(visit(only)),
    stopRefreshing: (only: string[]) => untrackPropRefresh(visit(only)),
    navigateTo: (component: string, url: string) => router.push({ component, url, props: { order: 'other page' } }),
    replaceSamePage: () => router.replace({ props: (props) => ({ ...props, unrelated: 'reloaded' }) }),
  }
}

describe('live prop payloads', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('writes a value the broadcast carried instead of reloading the prop', async () => {
    const live = await setup({ order: listeners(orders, 'OrderUpdated') })

    live.emit(orders, 'OrderUpdated', {
      order_id: 1,
      __inertia: { props: { order: { id: 1, total: '99.00' } } },
    })

    await live.settle()

    expect(live.props().order).toEqual({ id: 1, total: '99.00' })
    expect(live.requests()).toHaveLength(0)
  })

  it('ignores a key the subscription that delivered it does not feed', async () => {
    const live = await setup({
      order: listeners(orders, 'OrderUpdated'),
      stats: listeners(reports, 'ReportRebuilt'),
    })

    live.emit(orders, 'OrderUpdated', {
      __inertia: {
        props: {
          order: { id: 1, total: '99.00' },
          stats: { count: 500 },
          unrelated: 'overwritten',
        },
      },
    })

    await live.settle()

    expect(live.props().order).toEqual({ id: 1, total: '99.00' })
    expect(live.props().stats).toEqual({ count: 1 })
    expect(live.props().unrelated).toBe('untouched')
  })

  it('discards a value for a prop a request already claims and reloads it instead', async () => {
    const live = await setup({ order: listeners(orders, 'OrderUpdated') })

    live.startRefreshing(['order'])

    live.emit(orders, 'OrderUpdated', {
      __inertia: { props: { order: { id: 1, total: '99.00' } } },
    })

    await live.settle()

    expect(live.props().order).toEqual({ id: 1, total: '1.00' })
    expect(live.requests()).toHaveLength(0)

    live.stopRefreshing(['order'])

    await live.settle()

    expect(live.reloaded()).toEqual(['order'])
  })

  it('drops a value it has buffered when a request claims the prop before the write lands', async () => {
    const live = await setup({ order: listeners(orders, 'OrderUpdated') })

    live.emit(orders, 'OrderUpdated', {
      __inertia: { props: { order: { id: 1, total: '99.00' } } },
    })

    live.startRefreshing(['order'])

    live.emit(orders, 'OrderUpdated', {
      __inertia: { props: { order: { id: 1, total: '150.00' } } },
    })

    await live.settle()

    expect(live.props().order).toEqual({ id: 1, total: '1.00' })
    expect(live.writes()).toBe(0)
    expect(live.requests()).toHaveLength(0)

    live.stopRefreshing(['order'])

    await live.settle()

    expect(live.reloaded()).toEqual(['order'])
  })

  it('reloads the props of the subscription the payload left out', async () => {
    const live = await setup({
      order: { listeners: [{ channel: orders, events: ['OrderUpdated'] }] },
      stats: { listeners: [{ channel: orders, events: ['OrderUpdated'] }] },
    })

    live.emit(orders, 'OrderUpdated', {
      __inertia: { props: { order: { id: 1, total: '99.00' } } },
    })

    await live.settle()

    expect(live.props().order).toEqual({ id: 1, total: '99.00' })
    expect(live.reloaded()).toEqual(['stats'])
  })

  it('writes every path of one event in a single page write', async () => {
    const live = await setup({
      order: { listeners: [{ channel: orders, events: ['OrderUpdated'] }] },
      stats: { listeners: [{ channel: orders, events: ['OrderUpdated'] }] },
      activity: { listeners: [{ channel: orders, events: ['OrderUpdated'] }] },
    })

    live.emit(orders, 'OrderUpdated', {
      __inertia: {
        props: {
          order: { id: 1, total: '99.00' },
          stats: { count: 500 },
          activity: ['created', 'paid'],
        },
      },
    })

    await live.settle()

    expect(live.writes()).toBe(1)
    expect(live.props().order).toEqual({ id: 1, total: '99.00' })
    expect(live.props().stats).toEqual({ count: 500 })
    expect(live.props().activity).toEqual(['created', 'paid'])
  })

  // The manifest, not the payload, decides the order the paths are collected in,
  // so the two orders it can list an overlapping pair in are the cases to cover.
  it('applies an ancestor before its descendant when the manifest lists the ancestor first', async () => {
    const live = await setup({
      order: { listeners: [{ channel: orders, events: ['OrderUpdated'] }] },
      'order.total': { listeners: [{ channel: orders, events: ['OrderUpdated'] }] },
    })

    live.emit(orders, 'OrderUpdated', {
      __inertia: { props: { 'order.total': '5.00', order: { id: 2, total: '1.00' } } },
    })

    await live.settle()

    expect(live.props().order).toEqual({ id: 2, total: '5.00' })
  })

  it('applies an ancestor before its descendant when the manifest lists the descendant first', async () => {
    const live = await setup({
      'order.total': { listeners: [{ channel: orders, events: ['OrderUpdated'] }] },
      order: { listeners: [{ channel: orders, events: ['OrderUpdated'] }] },
    })

    live.emit(orders, 'OrderUpdated', {
      __inertia: { props: { order: { id: 2, total: '1.00' }, 'order.total': '5.00' } },
    })

    await live.settle()

    expect(live.props().order).toEqual({ id: 2, total: '5.00' })
  })

  it('reloads on an event that carries no envelope, even when it names a live prop', async () => {
    const live = await setup({ order: listeners(orders, 'OrderUpdated') })

    live.emit(orders, 'OrderUpdated', { order: { id: 9, total: '9.00' } })

    await live.settle()

    expect(live.props().order).toEqual({ id: 1, total: '1.00' })
    expect(live.writes()).toBe(0)
    expect(live.reloaded()).toEqual(['order'])
  })

  it('leaves the flash of the page it writes to alone', async () => {
    const live = await setup({ order: listeners(orders, 'OrderUpdated') }, {
      flash: { message: 'Order saved' },
    } as Partial<Page>)

    live.emit(orders, 'OrderUpdated', {
      __inertia: { props: { order: { id: 1, total: '99.00' } } },
    })

    await live.settle()

    expect(live.flash()).toEqual({ message: 'Order saved' })
  })

  it('drops a value it has not written yet when the page it arrived on is gone', async () => {
    const live = await setup({ order: listeners(orders, 'OrderUpdated') })

    live.emit(orders, 'OrderUpdated', {
      __inertia: { props: { order: { id: 1, total: '99.00' } } },
    })

    // Inside the collect window, so the value is still buffered
    live.navigateTo('Other', '/other')

    await live.settle()

    expect(live.props().order).toBe('other page')
  })

  it('keeps a buffered value when the page object is replaced but the page is the same', async () => {
    const live = await setup({ order: listeners(orders, 'OrderUpdated') })

    live.emit(orders, 'OrderUpdated', {
      __inertia: { props: { order: { id: 1, total: '99.00' } } },
    })

    // A partial reload replaces the whole page object, which must not read as
    // a page swap or every reload landing mid-window would eat a value
    live.replaceSamePage()

    await live.settle()

    expect(live.props().order).toEqual({ id: 1, total: '99.00' })
    expect(live.props().unrelated).toBe('reloaded')
  })

  it('keeps the manifest and the rest of the page metadata, so subscriptions survive', async () => {
    const live = await setup({ order: listeners(orders, 'OrderUpdated') }, {
      scrollProps: { activity: { pageName: 'page' } },
      mergeProps: ['activity'],
    } as unknown as Partial<Page>)

    live.emit(orders, 'OrderUpdated', {
      __inertia: { props: { order: { id: 1, total: '99.00' } } },
    })

    await live.settle()

    expect(live.liveProps()).toEqual({ order: listeners(orders, 'OrderUpdated') })
    expect(live.scrollProps()).toEqual({ activity: { pageName: 'page' } })
    expect(live.props().order).toEqual({ id: 1, total: '99.00' })
  })
})
