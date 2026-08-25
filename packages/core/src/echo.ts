import { LiveChannel, LiveChannelType, LiveConnectionStatus, LiveTransport } from './types'

/**
 * The slice of a Laravel Echo instance a live transport needs. Kept structural
 * so every `@laravel/echo-*` package satisfies it without core depending on any
 * of them.
 */
export interface EchoInstance {
  channel(name: string): EchoChannel
  private(name: string): EchoChannel
  encryptedPrivate(name: string): EchoChannel
  join(name: string): EchoChannel
  leaveChannel(name: string): void
  socketId(): string | null | undefined
  connector: {
    onConnectionChange(callback: (status: LiveConnectionStatus) => void): VoidFunction
  }
}

export interface EchoChannel {
  listen(event: string, callback: (payload: unknown) => void): unknown
  stopListening(event: string, callback: (payload: unknown) => void): unknown
}

export type EchoTransportConfig = {
  /** Resolves the Echo instance, e.g. `echo` from `@laravel/echo-vue`. */
  echo: () => EchoInstance
  /** Reports whether `configureEcho()` has run yet. */
  echoIsConfigured: () => boolean
}

/**
 * Echo subscribes with unprefixed names but stores protected channels under
 * their prefixed names, which is what `leaveChannel()` expects.
 */
const channelTypes: Record<
  LiveChannelType,
  { prefix: string; subscribe: (echo: EchoInstance, name: string) => EchoChannel }
> = {
  public: { prefix: '', subscribe: (echo, name) => echo.channel(name) },
  private: { prefix: 'private-', subscribe: (echo, name) => echo.private(name) },
  presence: { prefix: 'presence-', subscribe: (echo, name) => echo.join(name) },
  'encrypted-private': { prefix: 'private-encrypted-', subscribe: (echo, name) => echo.encryptedPrivate(name) },
}

// An unrecognised type falls back to a public channel rather than throwing,
// since the manifest is a hand-synced contract with the server
const typeFor = (channel: LiveChannel) => channelTypes[channel.type] ?? channelTypes.public

/**
 * Refcount by type and name so public `private-*` channels stay distinct from
 * private channels with the same stored name.
 */
const channelKey = (channel: LiveChannel): string => `${channel.type}:${channel.name}`

const prefixedChannelName = (channel: LiveChannel): string => `${typeFor(channel).prefix}${channel.name}`

/**
 * Laravel already sends the broadcast name. Prefix literal names with `.` so
 * Echo does not apply the app namespace.
 */
const formatEvent = (event: string): string => {
  return ['.', '\\'].includes(event.charAt(0)) ? event : `.${event}`
}

/**
 * Delivers live prop updates over Laravel Echo, resolving the configured Echo
 * instance on each use so `configureEcho()` swaps are respected.
 */
export const createEchoTransport = ({ echo, echoIsConfigured }: EchoTransportConfig): LiveTransport => {
  const listeners = new Map<string, number>()

  let statusCallback: ((status: LiveConnectionStatus) => void) | null = null
  let watch: { instance: EchoInstance; stop: VoidFunction } | null = null

  const resolve = (): EchoInstance => {
    if (!echoIsConfigured()) {
      throw new Error(
        'Echo has not been configured. Call `configureEcho()` before Inertia subscribes to a live prop, or pass a `resolve` option to `echo()`.',
      )
    }

    return echo()
  }

  // Watch only after a subscription exists, so resolving Echo does not connect
  // before anything can receive. Re-arm when configureEcho() swaps instances.
  const watchConnection = (instance: EchoInstance): void => {
    if (!statusCallback || watch?.instance === instance) {
      return
    }

    watch?.stop()

    watch = {
      instance,
      stop: instance.connector.onConnectionChange((status: LiveConnectionStatus) => {
        statusCallback?.(status)
      }),
    }
  }

  return {
    subscribe(channel, event, handler) {
      const key = channelKey(channel)
      const name = formatEvent(event)
      const instance = resolve()

      typeFor(channel).subscribe(instance, channel.name).listen(name, handler)
      watchConnection(instance)

      listeners.set(key, (listeners.get(key) ?? 0) + 1)

      return () => {
        const current = resolve()

        typeFor(channel).subscribe(current, channel.name).stopListening(name, handler)

        const remaining = (listeners.get(key) ?? 1) - 1

        if (remaining > 0) {
          listeners.set(key, remaining)
          return
        }

        // Unbinding the callback leaves the channel itself subscribed, so the
        // last listener has to leave it as well
        listeners.delete(key)
        current.leaveChannel(prefixedChannelName(channel))
      }
    },

    socketId: () => (echoIsConfigured() ? (echo().socketId() ?? null) : null),

    onStatusChange(callback) {
      statusCallback = callback

      if (listeners.size > 0) {
        watchConnection(resolve())
      }

      return () => {
        statusCallback = null
        watch?.stop()
        watch = null
      }
    },
  }
}
