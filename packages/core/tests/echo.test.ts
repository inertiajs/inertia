import { describe, expect, it } from 'vitest'
import { createEchoTransport, type EchoChannel, type EchoInstance } from '../src/echo'
import type { LiveChannel } from '../src/types'

const orders: LiveChannel = { name: 'orders.1', type: 'private' }

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
    socketId: () => null,
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
})
