import { describe, expect, it, vi } from 'vitest'
import { createEchoTransport, type EchoChannel, type EchoChannelType, type EchoInstance } from '../src/echo'
import { orders } from './liveHarness'

const fakeEcho = (label: string, log: string[]) => {
  const channels = new Map<string, EchoChannel>()

  const resolve = (name: string): EchoChannel => {
    if (!channels.has(name)) {
      log.push(`${label} join ${name}`)

      channels.set(name, {
        listen: (event) => log.push(`${label} listen ${name} ${event}`),
        stopListening: (event) => log.push(`${label} stopListening ${name} ${event}`),
        error: () => {},
      })
    }

    return channels.get(name)!
  }

  const instance: EchoInstance = {
    channel: (name) => resolve(name),
    private: (name) => resolve(`private-${name}`),
    encryptedPrivate: (name) => resolve(`private-encrypted-${name}`),
    join: (name) => resolve(`presence-${name}`),
    leaveChannel(name) {
      channels.delete(name)
      log.push(`${label} leave ${name}`)
    },
    socketId: () => `${label}-socket`,
    connector: { onConnectionChange: () => () => {} },
  }

  return instance
}

const prefixes: Record<EchoChannelType, string> = {
  public: '',
  private: 'private-',
  encrypted: 'private-encrypted-',
  presence: 'presence-',
}

const acquiringEcho = (log: string[]): EchoInstance => {
  const instance = fakeEcho('echo', log)
  const counts = new Map<string, number>()

  return {
    ...instance,
    acquire(name, type) {
      const fullName = prefixes[type] + name

      counts.set(fullName, (counts.get(fullName) ?? 0) + 1)
      log.push(`echo acquire ${fullName}`)

      return instance.channel(fullName)
    },
    release(name, type, options) {
      const fullName = prefixes[type] + name
      const remaining = (counts.get(fullName) ?? 0) - 1

      log.push(`echo release ${fullName}${options?.keepExisting ? ' keeping existing' : ''}`)

      if (remaining > 0) {
        counts.set(fullName, remaining)

        return
      }

      counts.delete(fullName)
      instance.leaveChannel(fullName)
    },
  }
}

describe('echo transport', () => {
  it('removes a listener from the instance it joined, even after Echo is reconfigured', () => {
    const log: string[] = []
    const first = fakeEcho('first', log)
    const second = fakeEcho('second', log)
    let current = first

    const transport = createEchoTransport({ echo: () => current, echoIsConfigured: () => true })
    const stop = transport.subscribe(orders, 'OrderUpdated', () => {})

    current = second
    log.length = 0

    stop()

    expect(log).toEqual(['first stopListening private-orders.1 .OrderUpdated', 'first leave private-orders.1'])
  })

  it('reads the socket id only from an instance a live prop already uses', () => {
    const log: string[] = []
    const instance = fakeEcho('echo', log)
    const resolveEcho = vi.fn(() => instance)

    const transport = createEchoTransport({ echo: resolveEcho, echoIsConfigured: () => true })

    // Resolving Echo connects it, which a request on a page without live props must not do
    expect(transport.socketId!()).toBeNull()
    expect(resolveEcho).not.toHaveBeenCalled()

    const stop = transport.subscribe(orders, 'OrderUpdated', () => {})

    expect(transport.socketId!()).toBe('echo-socket')

    stop()

    expect(transport.socketId!()).toBeNull()
  })

  it('asks for configureEcho() when a live prop subscribes before Echo is configured', () => {
    const resolveEcho = vi.fn(() => fakeEcho('echo', []))
    const transport = createEchoTransport({ echo: resolveEcho, echoIsConfigured: () => false })

    expect(transport.socketId!()).toBeNull()
    expect(() => transport.subscribe(orders, 'OrderUpdated', () => {})).toThrow('Echo has not been configured')
    expect(resolveEcho).not.toHaveBeenCalled()
  })

  it('shares a channel through acquire() so it never leaves one that is still in use elsewhere', () => {
    const log: string[] = []
    const instance = acquiringEcho(log)
    const transport = createEchoTransport({ echo: () => instance, echoIsConfigured: () => true })

    instance.acquire!('orders.1', 'private')

    const stopUpdated = transport.subscribe(orders, 'OrderUpdated', () => {})
    const stopShipped = transport.subscribe(orders, 'OrderShipped', () => {})

    stopUpdated()
    stopShipped()

    expect(log).not.toContain('echo leave private-orders.1')

    instance.release!('orders.1', 'private')

    expect(log).toEqual([
      'echo acquire private-orders.1',
      'echo join private-orders.1',
      'echo acquire private-orders.1',
      'echo listen private-orders.1 .OrderUpdated',
      'echo acquire private-orders.1',
      'echo listen private-orders.1 .OrderShipped',
      'echo stopListening private-orders.1 .OrderUpdated',
      'echo release private-orders.1 keeping existing',
      'echo stopListening private-orders.1 .OrderShipped',
      'echo release private-orders.1 keeping existing',
      'echo release private-orders.1',
      'echo leave private-orders.1',
    ])
  })

  it('acquires an encrypted channel by the type Echo knows it as', () => {
    const log: string[] = []
    const instance = acquiringEcho(log)
    const transport = createEchoTransport({ echo: () => instance, echoIsConfigured: () => true })

    const stop = transport.subscribe({ name: 'vault.1', type: 'encrypted-private' }, 'SecretUpdated', () => {})

    stop()

    expect(log).toContain('echo acquire private-encrypted-vault.1')
    expect(log).toContain('echo leave private-encrypted-vault.1')
  })

  it('falls back to joining and leaving when Echo only happens to have an acquire() method', () => {
    const log: string[] = []
    const acquire = vi.fn()
    const instance = { ...fakeEcho('echo', log), acquire } as EchoInstance
    const transport = createEchoTransport({ echo: () => instance, echoIsConfigured: () => true })

    transport.subscribe(orders, 'OrderUpdated', () => {})()

    expect(acquire).not.toHaveBeenCalled()
    expect(log).toContain('echo leave private-orders.1')
  })

  it('watches a rejoined channel for errors again when Echo reuses the channel object', () => {
    const error = vi.fn()
    const reusedChannel: EchoChannel = { listen: () => {}, stopListening: () => {}, error }
    const instance: EchoInstance = { ...fakeEcho('echo', []), private: () => reusedChannel }
    const transport = createEchoTransport({ echo: () => instance, echoIsConfigured: () => true })

    transport.subscribe(orders, 'OrderUpdated', () => {})()
    transport.subscribe(orders, 'OrderUpdated', () => {})()

    expect(error).toHaveBeenCalledTimes(2)
  })

  it('watches a channel for errors again once Echo has left it and hands the object out again', () => {
    const error = vi.fn()
    const reusedChannel: EchoChannel = { listen: () => {}, stopListening: () => {}, error }

    const instance: EchoInstance = {
      ...fakeEcho('echo', []),
      acquire: () => reusedChannel,
      release: () => true,
    }

    const transport = createEchoTransport({ echo: () => instance, echoIsConfigured: () => true })

    transport.subscribe(orders, 'OrderUpdated', () => {})()
    transport.subscribe(orders, 'OrderUpdated', () => {})()

    expect(error).toHaveBeenCalledTimes(2)
  })

  it('watches each channel for errors when Echo hands out one object for several channels', () => {
    const error = vi.fn()
    const sharedChannel: EchoChannel = { listen: () => {}, stopListening: () => {}, error }

    const instance: EchoInstance = {
      ...fakeEcho('echo', []),
      acquire: () => sharedChannel,
      release: () => {},
    }

    const transport = createEchoTransport({ echo: () => instance, echoIsConfigured: () => true })

    transport.subscribe(orders, 'OrderUpdated', () => {})
    transport.subscribe({ name: 'invoices.1', type: 'private' }, 'InvoicePaid', () => {})

    expect(error).toHaveBeenCalledTimes(2)
  })

  it('watches a shared channel for errors only once, however often live props rejoin it', () => {
    const error = vi.fn()
    const sharedChannel: EchoChannel = { listen: () => {}, stopListening: () => {}, error }

    const instance: EchoInstance = {
      ...fakeEcho('echo', []),
      acquire: () => sharedChannel,
      release: () => {},
    }

    const transport = createEchoTransport({ echo: () => instance, echoIsConfigured: () => true })

    transport.subscribe(orders, 'OrderUpdated', () => {})()
    transport.subscribe(orders, 'OrderUpdated', () => {})()

    expect(error).toHaveBeenCalledTimes(1)
  })
})
