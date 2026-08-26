import { createLiveChannelTracker, liveChannelName } from './liveChannel'
import { LiveOptions, LiveTransport } from './types'

/**
 * The slice of a Pusher channel a live transport needs.
 */
export interface PusherChannel {
  bind(event: string, handler: (payload: unknown) => void): unknown
  unbind(event: string, handler: (payload: unknown) => void): unknown
}

/**
 * The slice of a Pusher client a live transport needs. Kept structural so any
 * client speaking the Pusher protocol satisfies it, and so core needs no
 * dependency on `pusher-js` itself.
 */
export interface PusherClient {
  subscribe(name: string): PusherChannel
  channel(name: string): PusherChannel | undefined
  unsubscribe(name: string): void
  connection: {
    socket_id?: string | null
    bind(event: string, handler: (states: { current: string }) => void): unknown
    unbind(event: string, handler: (states: { current: string }) => void): unknown
  }
}

export type PusherOptions = {
  /**
   * The Pusher client to deliver updates over. Configuring it, including channel
   * authorization, stays with the application.
   */
  client: PusherClient
  throttle?: number
  pauseWhenHidden?: boolean
}

/**
 * Delivers live prop updates over a client speaking the Pusher protocol, which
 * covers Reverb, Soketi and Ably as well as Pusher itself.
 */
export const pusher = ({ client, ...options }: PusherOptions): LiveOptions => {
  const channels = createLiveChannelTracker()

  const transport: LiveTransport = {
    subscribe(channel, event, handler) {
      const name = liveChannelName(channel)

      // Pusher hands back the channel it already holds, so subscribing per
      // listener is safe and leaves nothing to undo if this throws
      client.subscribe(name).bind(event, handler)
      channels.acquire(channel)

      return () => {
        client.channel(name)?.unbind(event, handler)

        // Unbinding the handler leaves the channel itself subscribed, so the
        // last listener has to leave it as well
        if (channels.release(channel)) {
          client.unsubscribe(name)
        }
      }
    },

    socketId: () => client.connection.socket_id ?? null,

    onStatusChange(callback) {
      const handler = ({ current }: { current: string }) => callback(current === 'connected')

      client.connection.bind('state_change', handler)

      return () => client.connection.unbind('state_change', handler)
    },
  }

  return { transport, ...options }
}
