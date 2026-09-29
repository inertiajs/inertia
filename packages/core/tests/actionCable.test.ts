import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  actionCable,
  type ActionCableConsumer,
  type ActionCableIdentifier,
  type ActionCableSubscriptionMixin,
} from '../src/actionCable'
import type { LiveChannel } from '../src/types'
import { orders, stats, withEvent } from './liveHarness'

const fakeConsumer = () => {
  const subscriptions = new Map<string, ActionCableSubscriptionMixin>()
  const log: string[] = []

  const consumer: ActionCableConsumer = {
    subscriptions: {
      create(identifier: ActionCableIdentifier, mixin: ActionCableSubscriptionMixin) {
        const key = JSON.stringify(identifier)

        log.push(`create ${key}`)
        subscriptions.set(key, mixin)

        return {
          unsubscribe() {
            log.push(`unsubscribe ${key}`)
            subscriptions.delete(key)
          },
        }
      },
    },
  }

  const keyFor = ({ name, type }: LiveChannel) => JSON.stringify({ channel: 'InertiaChannel', stream: name, type })

  return {
    consumer,
    log,
    keyFor,
    count: () => subscriptions.size,
    at: (key: string) => subscriptions.get(key),
    receive: (channel: LiveChannel, payload: unknown) => subscriptions.get(keyFor(channel))?.received?.(payload),
    connect: (channel: LiveChannel) => subscriptions.get(keyFor(channel))?.connected?.(),
    disconnect: (channel: LiveChannel) => subscriptions.get(keyFor(channel))?.disconnected?.(),
  }
}

describe('actionCable', () => {
  let fake: ReturnType<typeof fakeConsumer>

  beforeEach(() => {
    fake = fakeConsumer()
  })

  it('passes the live options through alongside the transport', () => {
    const options = actionCable({ consumer: fake.consumer, throttle: 2000, pauseWhenHidden: false })

    expect(options.throttle).toBe(2000)
    expect(options.pauseWhenHidden).toBe(false)
    expect(options.transport.subscribeToChannel).toBeTypeOf('function')
  })

  it('subscribes to a single channel that streams from the channel name and type', () => {
    actionCable({ consumer: fake.consumer }).transport.subscribeToChannel(orders, () => {})

    expect(fake.log).toEqual(['create {"channel":"InertiaChannel","stream":"orders.1","type":"private"}'])
  })

  it('keeps two channels sharing a name but not a type apart', () => {
    const { transport } = actionCable({ consumer: fake.consumer })

    transport.subscribeToChannel({ name: 'orders.1', type: 'private' }, () => {})
    transport.subscribeToChannel({ name: 'orders.1', type: 'public' }, () => {})

    expect(fake.count()).toBe(2)
  })

  it('accepts a custom channel name and a custom identifier', () => {
    actionCable({ consumer: fake.consumer, channel: 'LiveChannel' }).transport.subscribeToChannel(orders, () => {})

    expect(fake.log).toContain('create {"channel":"LiveChannel","stream":"orders.1","type":"private"}')

    actionCable({
      consumer: fake.consumer,
      identifier: ({ name }) => ({ channel: 'OrdersChannel', id: name.split('.').pop() }),
    }).transport.subscribeToChannel(orders, () => {})

    expect(fake.log).toContain('create {"channel":"OrdersChannel","id":"1"}')
  })

  it('passes the channel params through, but never lets them take over its identity', () => {
    actionCable({ consumer: fake.consumer }).transport.subscribeToChannel(
      { name: 'orders.1', type: 'private', params: { id: 1, stream: 'hijacked', type: 'public' } },
      () => {},
    )

    expect(fake.log).toContain('create {"channel":"InertiaChannel","id":1,"stream":"orders.1","type":"private"}')
  })

  it('hands every message on the channel straight to core', () => {
    const handler = vi.fn()

    actionCable({ consumer: fake.consumer }).transport.subscribeToChannel(orders, handler)

    const payload = withEvent('order.updated')
    fake.receive(orders, payload)

    expect(handler).toHaveBeenCalledWith(payload)
  })

  it('keeps streams independent, and re-subscribes a channel that was disposed', () => {
    const { transport } = actionCable({ consumer: fake.consumer })

    transport.subscribeToChannel(orders, () => {})
    const stopStats = transport.subscribeToChannel(stats, () => {})

    stopStats()

    expect(fake.log).toContain('unsubscribe {"channel":"InertiaChannel","stream":"stats","type":"public"}')
    expect(fake.count()).toBe(1)

    transport.subscribeToChannel(stats, () => {})

    expect(fake.count()).toBe(2)
    expect(fake.log.filter((entry) => entry.includes('"stream":"stats"'))).toHaveLength(3)
  })

  it('resolves a consumer given as a function on every subscribe', () => {
    const resolve = vi.fn(() => fake.consumer)
    const { transport } = actionCable({ consumer: resolve })

    expect(resolve).not.toHaveBeenCalled()

    transport.subscribeToChannel(orders, () => {})
    transport.subscribeToChannel(stats, () => {})

    expect(resolve).toHaveBeenCalledTimes(2)
  })

  it('hands its event name resolver to core rather than reading events itself', () => {
    const eventName = (payload: unknown) => (payload as { type?: string })?.type

    expect(actionCable({ consumer: fake.consumer, eventName }).transport.eventName).toBe(eventName)
    expect(actionCable({ consumer: fake.consumer }).transport.eventName).toBeUndefined()
  })

  it('leaves the socket id to core unless one is given, since Action Cable issues none', () => {
    expect(actionCable({ consumer: fake.consumer }).transport.socketId).toBeUndefined()
    expect(actionCable({ consumer: fake.consumer, socketId: () => 'mine' }).transport.socketId!()).toBe('mine')
  })

  it('reports whether the connection is up', () => {
    const statuses: boolean[] = []
    const { transport } = actionCable({ consumer: fake.consumer })

    transport.subscribeToChannel(orders, () => {})

    const stop = transport.onStatusChange!((connected) => statuses.push(connected))

    fake.disconnect(orders)
    fake.connect(orders)

    expect(statuses).toEqual([false, true])

    stop()
    fake.disconnect(orders)

    expect(statuses).toEqual([false, true])
  })
})
