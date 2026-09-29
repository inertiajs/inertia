import { clientSocketId } from './clientSocketId'
import { LiveChannel, LiveChannelTransport, LiveOptions, SocketIdResolver } from './types'

export type ActionCableIdentifier = { channel: string } & Record<string, unknown>

export interface ActionCableSubscriptionMixin {
  connected?(): void
  disconnected?(): void
  received?(payload: unknown): void
}

export interface ActionCableSubscription {
  unsubscribe(): void
}

/**
 * Kept structural so core needs no dependency on `@rails/actioncable`, and so
 * anything speaking the Action Cable protocol satisfies it.
 */
export interface ActionCableConsumer {
  subscriptions: {
    create(identifier: ActionCableIdentifier, mixin: ActionCableSubscriptionMixin): ActionCableSubscription
  }
}

/**
 * Action Cable identifies a subscription by these params, so the name and type
 * are pinned after whatever the server sent: they carry the channel's identity,
 * and two channels sharing an identifier would be delivered each other's events.
 */
const defaultIdentifier =
  (channel: string) =>
  ({ name, type, params }: LiveChannel): ActionCableIdentifier => ({
    channel,
    ...params,
    stream: name,
    type,
  })

export type ActionCableOptions = {
  consumer: ActionCableConsumer | (() => ActionCableConsumer)
  channel?: string
  identifier?: (channel: LiveChannel) => ActionCableIdentifier
  eventName?: (payload: unknown) => string | undefined
  socketId?: SocketIdResolver
  throttle?: number
  pauseWhenHidden?: boolean
}

export const actionCable = ({
  consumer,
  channel = 'InertiaChannel',
  identifier = defaultIdentifier(channel),
  eventName,
  socketId = clientSocketId,
  ...options
}: ActionCableOptions): LiveOptions => {
  let statusCallback: ((connected: boolean) => void) | null = null

  const resolveConsumer = (): ActionCableConsumer => {
    return typeof consumer === 'function' ? consumer() : consumer
  }

  const transport: LiveChannelTransport = {
    subscribeToChannel(liveChannel, handler) {
      const subscription = resolveConsumer().subscriptions.create(identifier(liveChannel), {
        received: handler,

        connected() {
          statusCallback?.(true)
        },

        disconnected() {
          statusCallback?.(false)
        },
      })

      return () => subscription.unsubscribe()
    },

    eventName,

    // Action Cable issues no socket id, so the client brings its own for the
    // server to send back on a broadcast
    socketId,

    /**
     * Action Cable reports the connection per subscription, so a reconnect
     * calls back once for each. Repeating a status is safe, since the live
     * engine only acts on the change.
     */
    onStatusChange(callback) {
      statusCallback = callback

      return () => {
        statusCallback = null
      }
    },
  }

  return { transport, ...options }
}
