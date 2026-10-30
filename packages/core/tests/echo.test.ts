import { describe, expect, it, vi } from 'vitest'
import { createEchoTransport, type EchoChannel, type EchoInstance } from '../src/echo'
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
})
