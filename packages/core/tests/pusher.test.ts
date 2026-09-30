import { beforeEach, describe, expect, it, vi } from 'vitest'
import { pusher, type PusherChannel, type PusherClient } from '../src/pusher'
import type { LiveChannel } from '../src/types'

const orders: LiveChannel = { name: 'orders.1', type: 'private' }
const stats: LiveChannel = { name: 'stats', type: 'public' }

const fakeClient = () => {
  const channels = new Map<string, PusherChannel & { bind: ReturnType<typeof vi.fn> }>()
  const log: string[] = []
  let stateHandler: ((states: { current: string }) => void) | null = null

  const client: PusherClient = {
    subscribe(name) {
      log.push(`subscribe ${name}`)

      if (!channels.has(name)) {
        channels.set(name, { bind: vi.fn(), unbind: vi.fn() } as never)
      }

      return channels.get(name)!
    },
    channel: (name) => channels.get(name),
    unsubscribe(name) {
      log.push(`unsubscribe ${name}`)
      channels.delete(name)
    },
    connection: {
      socket_id: 'socket-1',
      bind: (_event, handler) => (stateHandler = handler),
      unbind: () => (stateHandler = null),
    },
  }

  return {
    client,
    log,
    channel: (name: string) => channels.get(name),
    changeState: (current: string) => stateHandler?.({ current }),
    isWatchingState: () => stateHandler !== null,
  }
}

describe('pusher', () => {
  let fake: ReturnType<typeof fakeClient>

  beforeEach(() => {
    fake = fakeClient()
  })

  it('passes the live options through alongside the transport', () => {
    const options = pusher({ client: fake.client, throttle: 2000, pauseWhenHidden: false })

    expect(options.throttle).toBe(2000)
    expect(options.pauseWhenHidden).toBe(false)
    expect(options.transport.subscribe).toBeTypeOf('function')
  })

  it('subscribes to the prefixed channel name and binds the event', () => {
    pusher({ client: fake.client }).transport.subscribe(orders, 'OrderUpdated', () => {})

    expect(fake.log).toEqual(['subscribe private-orders.1'])
    expect(fake.channel('private-orders.1')!.bind).toHaveBeenCalledWith('OrderUpdated', expect.any(Function))
  })

  it('hands the payload to the handler it was given', () => {
    const handler = vi.fn()

    pusher({ client: fake.client }).transport.subscribe(orders, 'OrderUpdated', handler)

    const bound = fake.channel('private-orders.1')!.bind.mock.calls[0][1]
    bound({ id: 1 })

    expect(handler).toHaveBeenCalledWith({ id: 1 })
  })

  it('leaves a channel only once its last listener has gone', () => {
    const { transport } = pusher({ client: fake.client })

    const stopOrder = transport.subscribe(orders, 'OrderUpdated', () => {})
    const stopNotes = transport.subscribe(orders, 'NotesUpdated', () => {})

    stopOrder()
    expect(fake.log).not.toContain('unsubscribe private-orders.1')

    stopNotes()
    expect(fake.log).toContain('unsubscribe private-orders.1')
  })

  it('counts channels separately, so leaving one leaves the others alone', () => {
    const { transport } = pusher({ client: fake.client })

    transport.subscribe(orders, 'OrderUpdated', () => {})
    const stopStats = transport.subscribe(stats, 'StatsUpdated', () => {})

    stopStats()

    expect(fake.log).toContain('unsubscribe stats')
    expect(fake.log).not.toContain('unsubscribe private-orders.1')
  })

  it('reports the socket id, and null when the connection has none', () => {
    expect(pusher({ client: fake.client }).transport.socketId!()).toBe('socket-1')

    fake.client.connection.socket_id = null

    expect(pusher({ client: fake.client }).transport.socketId!()).toBeNull()
  })

  it('reports whether the connection is up', () => {
    const statuses: boolean[] = []
    const stop = pusher({ client: fake.client }).transport.onStatusChange!((connected) => statuses.push(connected))

    fake.changeState('connecting')
    fake.changeState('connected')
    fake.changeState('unavailable')
    fake.changeState('failed')

    expect(statuses).toEqual([false, true, false, false])

    stop()
    expect(fake.isWatchingState()).toBe(false)
  })
})
