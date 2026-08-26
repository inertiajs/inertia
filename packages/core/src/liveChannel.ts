import { LiveChannel, LiveChannelType } from './types'

/**
 * Laravel's channel prefixes, which follow Pusher's convention.
 */
const prefixes: Record<LiveChannelType, string> = {
  public: '',
  private: 'private-',
  presence: 'presence-',
  'encrypted-private': 'private-encrypted-',
}

/**
 * Return the broadcaster channel name for a Laravel live channel.
 */
export const liveChannelName = (channel: LiveChannel): string => {
  return `${prefixes[channel.type] ?? ''}${channel.name}`
}

/**
 * Counts the listeners on each channel, so a transport knows when to join and
 * leave one. Counted by type and name, so a public channel called
 * `private-orders.1` stays distinct from a private `orders.1`.
 */
export const createLiveChannelTracker = () => {
  const counts = new Map<string, number>()

  const key = (channel: LiveChannel): string => `${channel.type}:${channel.name}`

  return {
    /**
     * Register a listener on a channel.
     */
    acquire(channel: LiveChannel): void {
      counts.set(key(channel), (counts.get(key(channel)) ?? 0) + 1)
    },

    /**
     * Drop a listener. Returns true when it was the last on the channel.
     */
    release(channel: LiveChannel): boolean {
      const remaining = (counts.get(key(channel)) ?? 1) - 1

      if (remaining > 0) {
        counts.set(key(channel), remaining)

        return false
      }

      counts.delete(key(channel))

      return true
    },

    /**
     * Whether any channel currently has a listener, which is the point at which
     * a transport has something worth connecting for.
     */
    hasAny(): boolean {
      return counts.size > 0
    },
  }
}
