import type { LiveChannel, LiveEventHandler, LiveTransport } from '@inertiajs/core'

type FakeLiveSubscription = {
  channel: LiveChannel
  event: string
  handler: LiveEventHandler
}

export type FakeLiveTransportControls = {
  emit(channel: string, event: string, payload?: unknown): void
  status(connected: boolean): void
  subscriptions(): string[]
}

/**
 * A transport that broadcasts nothing on its own. Events are pushed in from the
 * outside through `window.__inertiaLive`, which makes live props testable
 * without a broadcaster.
 */
export const fakeLiveTransport = ({
  socketId = 'fake-socket-id',
}: { socketId?: string | null } = {}): LiveTransport => {
  const subscriptions = new Set<FakeLiveSubscription>()
  const statusCallbacks = new Set<(connected: boolean) => void>()

  if (typeof window !== 'undefined') {
    window.__inertiaLive = {
      emit(channel, event, payload = null) {
        subscriptions.forEach((subscription) => {
          if (subscription.channel.name === channel && subscription.event === event) {
            subscription.handler(payload)
          }
        })
      },

      status(connected) {
        statusCallbacks.forEach((callback) => callback(connected))
      },

      subscriptions() {
        return Array.from(subscriptions).map(
          (subscription) => `${subscription.channel.type}:${subscription.channel.name}::${subscription.event}`,
        )
      },
    }
  }

  return {
    subscribe(channel, event, handler) {
      const subscription: FakeLiveSubscription = { channel, event, handler }

      subscriptions.add(subscription)

      return () => {
        subscriptions.delete(subscription)
      }
    },

    socketId: () => socketId,

    onStatusChange(callback) {
      statusCallbacks.add(callback)

      return () => {
        statusCallbacks.delete(callback)
      }
    },
  }
}
