import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { LiveTransport } from '../src/types'

const setup = async () => {
  const { socketId } = await import('../src/socketId')
  const { configureLive } = await import('../src/live')
  const { clientSocketId } = await import('../src/clientSocketId')

  vi.stubGlobal('window', { setTimeout, clearTimeout, addEventListener: () => {}, removeEventListener: () => {} })
  vi.stubGlobal('document', { addEventListener: () => {}, removeEventListener: () => {}, hidden: false })

  const channelTransport = { subscribeToChannel: () => () => {} }
  const eventTransport: LiveTransport = { subscribe: () => () => {}, socketId: () => 'from-transport' }

  return { socketId, configureLive, clientSocketId, channelTransport, eventTransport }
}

describe('socket id', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.unstubAllGlobals()
  })

  it('gives a transport that issues no socket id one of its own', async () => {
    const { socketId, configureLive, clientSocketId } = await setup()

    expect(socketId.resolve()).toBeNull()

    configureLive({ transport: { subscribeToChannel: () => () => {} } })

    expect(socketId.resolve()).toBe(clientSocketId())
  })

  it('prefers a socket id the transport issues itself', async () => {
    const { socketId, configureLive, eventTransport } = await setup()

    configureLive({ transport: eventTransport })

    expect(socketId.resolve()).toBe('from-transport')
  })

  it.each(['channelTransport', 'eventTransport'] as const)(
    'leaves a resolver the app registered first alone (%s)',
    async (transport) => {
      const context = await setup()

      context.socketId.resolveUsing(() => 'from-app')
      context.configureLive({ transport: context[transport] })

      expect(context.socketId.resolve()).toBe('from-app')
    },
  )

  it.each(['channelTransport', 'eventTransport'] as const)(
    'treats clearing the resolver as a choice, so the default does not undo it (%s)',
    async (transport) => {
      const context = await setup()

      context.socketId.resolveUsing(null)
      context.configureLive({ transport: context[transport] })

      expect(context.socketId.resolve()).toBeNull()
    },
  )

  it('lets the app take over after the default is installed', async () => {
    const { socketId, configureLive, channelTransport } = await setup()

    configureLive({ transport: channelTransport })
    socketId.resolveUsing(() => 'from-app')

    expect(socketId.resolve()).toBe('from-app')
  })
})
