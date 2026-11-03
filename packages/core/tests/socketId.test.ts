import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { LiveTransport } from '../src/types'

const setup = async () => {
  const { socketId } = await import('../src/socketId')
  const { configureLive } = await import('../src/live')

  vi.stubGlobal('window', { setTimeout, clearTimeout, addEventListener: () => {}, removeEventListener: () => {} })
  vi.stubGlobal('document', { addEventListener: () => {}, removeEventListener: () => {}, hidden: false })

  const channelTransport = { subscribeToChannel: () => () => {} }
  const eventTransport: LiveTransport = { subscribe: () => () => {}, socketId: () => 'from-transport' }

  return { socketId, configureLive, channelTransport, eventTransport }
}

describe('socket id', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.unstubAllGlobals()
  })

  it('sends no socket id for a transport that issues none', async () => {
    const { socketId, configureLive, channelTransport } = await setup()

    configureLive({ transport: channelTransport })

    expect(socketId.resolve()).toBeNull()
  })

  it('reads the socket id off a transport written as a class', async () => {
    const { socketId, configureLive } = await setup()

    class ClassTransport {
      protected connection = { id: '123.456' }

      public subscribe() {
        return () => {}
      }

      public socketId() {
        return this.connection.id
      }
    }

    configureLive({ transport: new ClassTransport() })

    expect(socketId.resolve()).toBe('123.456')
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
