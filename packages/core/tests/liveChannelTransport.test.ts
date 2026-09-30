import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { LiveChannel, LiveEventHandler, LiveProp, Page } from '../src/types'
import { listeners, orders, reports, stubBrowser, withEvent } from './liveHarness'

const setup = async (
  liveProps: Record<string, LiveProp>,
  { eventName }: { eventName?: (payload: unknown) => string | undefined } = {},
) => {
  const requests = stubBrowser()

  const { router } = await import('../src/index')
  const { configureLive } = await import('../src/live')
  const { socketId } = await import('../src/socketId')
  const { page: currentPage } = await import('../src/page')

  const handlers = new Map<string, LiveEventHandler>()
  const subscribed: string[] = []
  const unsubscribed: string[] = []

  router.init({
    initialPage: {
      component: 'Orders',
      url: '/orders',
      version: '1',
      props: { order: { id: 1 }, stats: { count: 1 }, activity: ['created'] },
      flash: {},
      liveProps,
      rememberedState: {},
      rescuedProps: [],
      clearHistory: false,
      encryptHistory: false,
    } as Page,
    swapComponent: () => Promise.resolve(),
    resolveComponent: (name) => name,
  })

  configureLive({
    transport: {
      subscribeToChannel(channel, handler) {
        subscribed.push(channel.name)
        handlers.set(channel.name, handler)

        return () => {
          unsubscribed.push(channel.name)
          handlers.delete(channel.name)
        }
      },
      eventName,
      socketId: () => 'me',
    },
    throttle: 0,
    pauseWhenHidden: false,
  })

  const settle = () => new Promise((resolve) => setTimeout(resolve, 80))

  await settle()
  requests.length = 0

  return {
    emit: (channel: LiveChannel, payload: unknown) => handlers.get(channel.name)?.(payload),
    settle,
    subscribed,
    unsubscribed,
    socketId,
    // The same entry point a server response goes through, which is what fires
    // the `pageUpdated` the live engine syncs on
    setLiveProps: (next: Record<string, LiveProp>) =>
      currentPage.set({ ...currentPage.get(), liveProps: next }, { preserveState: true }),
    reloaded: () => requests.map((request) => request.headers['X-Inertia-Partial-Data']),
  }
}

describe('channel transports', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('subscribes once per channel rather than once per event', async () => {
    const live = await setup({
      order: listeners(orders, 'order.updated', 'order.shipped'),
      activity: listeners(orders, 'activity.logged'),
    })

    expect(live.subscribed).toEqual(['orders.1'])
  })

  it('routes a message to the props the delivering event feeds, and no others', async () => {
    const live = await setup({
      order: listeners(orders, 'order.updated'),
      activity: listeners(orders, 'activity.logged'),
    })

    live.emit(orders, withEvent('order.updated'))
    await live.settle()

    expect(live.reloaded()).toEqual(['order'])
  })

  it('keeps the payload whitelist to the delivering subscription, not the channel', async () => {
    const live = await setup({
      order: listeners(orders, 'order.updated'),
      activity: listeners(orders, 'activity.logged'),
    })

    // `activity` shares the channel but not the event, so its value is refused
    // and it is left alone rather than reloaded
    live.emit(orders, withEvent('order.updated', { props: { order: { id: 2 }, activity: ['forged'] } }))
    await live.settle()

    expect(live.reloaded()).toEqual([])
  })

  it('ignores a message carrying no event name', async () => {
    const live = await setup({ order: listeners(orders, 'order.updated') })

    live.emit(orders, { id: 1 })
    live.emit(orders, null)
    await live.settle()

    expect(live.reloaded()).toEqual([])
  })

  it('ignores an event nothing on the channel listens for', async () => {
    const live = await setup({ order: listeners(orders, 'order.updated') })

    live.emit(orders, withEvent('order.cancelled'))
    await live.settle()

    expect(live.reloaded()).toEqual([])
  })

  it('reads the event name with the transport resolver when it has one', async () => {
    const live = await setup(
      { order: listeners(orders, 'order.updated') },
      { eventName: (payload) => (payload as { type?: string })?.type },
    )

    live.emit(orders, { type: 'order.updated' })
    await live.settle()

    expect(live.reloaded()).toEqual(['order'])
  })

  it('subscribes to each channel a prop listens on', async () => {
    const live = await setup({
      order: listeners(orders, 'order.updated'),
      stats: listeners(reports, 'stats.updated'),
    })

    expect(live.subscribed.sort()).toEqual(['orders.1', 'reports'])
  })

  it('drops an event this client caused', async () => {
    const live = await setup({ order: listeners(orders, 'order.updated') })

    live.emit(orders, withEvent('order.updated', { socketId: 'me' }))
    await live.settle()
    expect(live.reloaded()).toEqual([])

    live.emit(orders, withEvent('order.updated', { socketId: 'someone-else' }))
    await live.settle()
    expect(live.reloaded()).toEqual(['order'])
  })
  it('keeps a channel subscribed while any prop still listens on it', async () => {
    const live = await setup({
      order: listeners(orders, 'order.updated'),
      activity: listeners(orders, 'activity.logged'),
    })

    await live.setLiveProps({ order: listeners(orders, 'order.updated') })
    await live.settle()

    expect(live.subscribed).toEqual(['orders.1'])
    expect(live.unsubscribed).toEqual([])
  })

  it('unsubscribes a channel once no prop listens on it', async () => {
    const live = await setup({
      order: listeners(orders, 'order.updated'),
      stats: listeners(reports, 'stats.updated'),
    })

    await live.setLiveProps({ order: listeners(orders, 'order.updated') })
    await live.settle()

    expect(live.unsubscribed).toEqual(['reports'])
    expect(live.subscribed.sort()).toEqual(['orders.1', 'reports'])
  })
})
