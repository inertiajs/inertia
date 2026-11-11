import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ActiveVisit, LiveChannel, LiveEventDetails, LiveEventHandler, LiveProp, Page } from '../src/types'
import { listeners, orders, ordersPage, reports, settle, stubBrowser } from './liveHarness'

const layerId = 'layer-1'

const setup = async ({
  pageLiveProps = {},
  layerLiveProps = {},
}: {
  pageLiveProps?: Record<string, LiveProp>
  layerLiveProps?: Record<string, LiveProp>
}) => {
  const requests = stubBrowser()
  const events: LiveEventDetails[] = []

  document.dispatchEvent = (event: Event) => {
    if (event.type === 'inertia:live') {
      events.push((event as CustomEvent<LiveEventDetails>).detail)
    }

    return true
  }

  const { router } = await import('../src/index')
  const { composeLayer } = await import('../src/layers')
  const { configureLive } = await import('../src/live')
  const { page: currentPage } = await import('../src/page')
  const { propRefreshes, trackPropRefresh } = await import('../src/propRefreshes')

  const handlers = new Map<string, LiveEventHandler>()
  const unsubscribed: string[] = []

  const base = ordersPage({
    props: { order: { id: 1, total: '1.00' }, stats: { count: 1 } } as unknown as Page['props'],
    liveProps: pageLiveProps,
  })

  const layer = {
    component: 'Orders/Edit',
    url: '/orders/1/edit',
    version: '1',
    props: { order: { id: 1, total: '2.00' }, stats: { count: 2 } },
    layer: { base: '/orders' },
    liveProps: layerLiveProps,
  } as unknown as Page

  router.init({
    initialPage: composeLayer(base, layer, layerId),
    swapComponent: () => Promise.resolve(),
    resolveComponent: (name) => name,
  })

  configureLive({
    transport: {
      subscribe: (channel, event, handler) => {
        const key = `${channel.name}::${event}`

        handlers.set(key, handler)

        return () => unsubscribed.push(key)
      },
    },
    throttle: 0,
    pauseWhenHidden: false,
  })

  await settle()

  requests.splice(0)

  return {
    emit: (channel: LiveChannel, event: string, payload: unknown = {}) =>
      handlers.get(`${channel.name}::${event}`)!(payload),
    settle,
    events,
    unsubscribed,
    requests,
    pageProps: () => currentPage.get().props,
    layerProps: () => currentPage.get().layers?.[0]?.props,
    isRefreshing: propRefreshes.isRefreshing,
    startRefreshingLayer: (only: string[]) =>
      trackPropRefresh({
        id: 'refresh',
        url: new URL('http://localhost/orders/1/edit'),
        layerId,
        only,
        except: [],
        reset: [],
      } as unknown as ActiveVisit),
    closeLayer: async () => {
      const { layers, ...beneath } = currentPage.get()

      await currentPage.set(beneath as Page, { replace: true, preserveState: true })
    },
  }
}

describe('live props inside a layer', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('writes a value the broadcast carried into the layer that declared the prop', async () => {
    const live = await setup({ layerLiveProps: { order: listeners(orders, 'OrderUpdated') } })

    live.emit(orders, 'OrderUpdated', { __inertia: { props: { order: { id: 1, total: '99.00' } } } })

    await live.settle()

    expect(live.layerProps()?.order).toEqual({ id: 1, total: '99.00' })
    expect(live.pageProps().order).toEqual({ id: 1, total: '1.00' })
    expect(live.requests).toHaveLength(0)
  })

  it("reloads a layer's live prop from the layer's own url", async () => {
    const live = await setup({ layerLiveProps: { order: listeners(orders, 'OrderUpdated') } })

    live.emit(orders, 'OrderUpdated')

    await live.settle()

    expect(live.requests).toHaveLength(1)
    expect(live.requests[0].url).toBe('http://localhost/orders/1/edit')
    expect(live.requests[0].headers['X-Inertia-Partial-Component']).toBe('Orders/Edit')
    expect(live.requests[0].headers['X-Inertia-Partial-Data']).toBe('order')
  })

  it('reloads the page beneath an open layer from its own url', async () => {
    const live = await setup({ pageLiveProps: { stats: listeners(reports, 'ReportRebuilt') } })

    live.emit(reports, 'ReportRebuilt')

    await live.settle()

    expect(live.requests).toHaveLength(1)
    expect(live.requests[0].url).toBe('http://localhost/orders')
    expect(live.requests[0].headers['X-Inertia-Partial-Component']).toBe('Orders')
    expect(live.requests[0].headers['X-Inertia-Partial-Data']).toBe('stats')
  })

  it('reloads each tier that an event feeds with a request of its own', async () => {
    const live = await setup({
      pageLiveProps: { order: listeners(orders, 'OrderUpdated') },
      layerLiveProps: { order: listeners(orders, 'OrderUpdated') },
    })

    live.emit(orders, 'OrderUpdated')

    await live.settle()

    expect(live.requests.map((request) => request.url).sort()).toEqual([
      'http://localhost/orders',
      'http://localhost/orders/1/edit',
    ])
  })

  it('announces the event once for each tier, naming the layer it feeds', async () => {
    const live = await setup({
      pageLiveProps: { order: listeners(orders, 'OrderUpdated') },
      layerLiveProps: { order: listeners(orders, 'OrderUpdated') },
    })

    live.emit(orders, 'OrderUpdated')

    expect(live.events.map((event) => event.layerId)).toEqual([undefined, layerId])
  })

  it('reloads a prop the layer is already refreshing instead of writing the value, leaving the page free to write', async () => {
    const live = await setup({
      pageLiveProps: { order: listeners(orders, 'OrderUpdated') },
      layerLiveProps: { order: listeners(orders, 'OrderUpdated') },
    })

    live.startRefreshingLayer(['order'])
    live.emit(orders, 'OrderUpdated', { __inertia: { props: { order: { id: 1, total: '99.00' } } } })

    await live.settle()

    expect(live.isRefreshing('order', layerId)).toBe(true)
    expect(live.isRefreshing('order')).toBe(false)
    expect(live.pageProps().order).toEqual({ id: 1, total: '99.00' })
    expect(live.layerProps()?.order).toEqual({ id: 1, total: '2.00' })
  })

  it('stops listening once the layer that declared the prop closes', async () => {
    const live = await setup({ layerLiveProps: { order: listeners(orders, 'OrderUpdated') } })

    await live.closeLayer()

    expect(live.unsubscribed).toEqual(['orders.1::OrderUpdated'])
  })
})
