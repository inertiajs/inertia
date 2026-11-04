import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { LiveEventHandler, LiveProp } from '../src/types'
import { listeners, orders, ordersPage, partialData, stubBrowser } from './liveHarness'

const setup = async (liveProps: Record<string, LiveProp>, { jitter }: { jitter?: number } = {}) => {
  const requests = stubBrowser()

  const { router } = await import('../src/index')
  const { configureLive } = await import('../src/live')
  const { page: currentPage } = await import('../src/page')

  const handlers = new Map<string, LiveEventHandler>()
  let setStatus: (connected: boolean) => void = () => {}

  router.init({
    initialPage: ordersPage({ props: { order: { id: 1, total: '1.00' } }, liveProps }),
    swapComponent: () => Promise.resolve(),
    resolveComponent: (name) => name,
  })

  configureLive({
    transport: {
      subscribe: (channel, event, handler) => {
        handlers.set(`${channel.name}::${event}`, handler)
        return () => {}
      },
      onStatusChange: (callback) => {
        setStatus = callback
        return () => {}
      },
    },
    jitter,
    pauseWhenHidden: false,
  })

  await vi.advanceTimersByTimeAsync(100)
  requests.length = 0

  return {
    emit: (payload: unknown = null) => handlers.get('orders.1::OrderUpdated')!(payload),
    status: (connected: boolean) => setStatus(connected),
    props: () => currentPage.get().props,
    reloaded: () => partialData(requests),
  }
}

describe('live prop jitter', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('reloads after the collect window alone when no jitter is set', async () => {
    const live = await setup({ order: listeners(orders, 'OrderUpdated') })

    live.emit()

    await vi.advanceTimersByTimeAsync(31)
    expect(live.reloaded()).toEqual([])

    await vi.advanceTimersByTimeAsync(1)
    expect(live.reloaded()).toEqual(['order'])
  })

  it('waits a random part of the jitter on top of the collect window', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    const live = await setup({ order: listeners(orders, 'OrderUpdated') }, { jitter: 1000 })

    live.emit()

    await vi.advanceTimersByTimeAsync(531)
    expect(live.reloaded()).toEqual([])

    await vi.advanceTimersByTimeAsync(1)
    expect(live.reloaded()).toEqual(['order'])
  })

  it('draws the jitter once per flush, so later events in a burst neither delay nor hurry it', async () => {
    const random = vi.spyOn(Math, 'random').mockReturnValue(0.5)
    const live = await setup({ order: listeners(orders, 'OrderUpdated') }, { jitter: 1000 })

    live.emit()
    random.mockReturnValue(0)
    await vi.advanceTimersByTimeAsync(100)
    live.emit()
    await vi.advanceTimersByTimeAsync(100)
    live.emit()

    await vi.advanceTimersByTimeAsync(331)
    expect(live.reloaded()).toEqual([])

    await vi.advanceTimersByTimeAsync(1)
    expect(live.reloaded()).toEqual(['order'])
  })

  it('jitters the refresh that follows a reconnect', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    const live = await setup({ order: listeners(orders, 'OrderUpdated') }, { jitter: 1000 })

    live.status(true)
    live.status(false)
    live.status(true)

    await vi.advanceTimersByTimeAsync(531)
    expect(live.reloaded()).toEqual([])

    await vi.advanceTimersByTimeAsync(1)
    expect(live.reloaded()).toEqual(['order'])
  })

  it('writes a value the broadcast carried without waiting for the jitter', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    const live = await setup({ order: listeners(orders, 'OrderUpdated') }, { jitter: 1000 })

    live.emit({ __inertia: { props: { order: { id: 1, total: '99.00' } } } })

    await vi.advanceTimersByTimeAsync(40)
    expect(live.props().order).toEqual({ id: 1, total: '99.00' })

    await vi.advanceTimersByTimeAsync(1000)
    expect(live.reloaded()).toEqual([])
  })
})
