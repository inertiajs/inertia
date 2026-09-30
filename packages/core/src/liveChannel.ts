import { LiveChannel, LiveChannelType } from './types'

const prefixes: Record<LiveChannelType, string> = {
  public: '',
  private: 'private-',
  presence: 'presence-',
  'encrypted-private': 'private-encrypted-',
}

export const liveChannelName = (channel: LiveChannel): string => {
  return `${prefixes[channel.type as LiveChannelType] ?? ''}${channel.name}`
}

/**
 * `params` are left out, so a server varying them cannot churn the subscription.
 */
export const liveChannelKey = (channel: LiveChannel): string => `${channel.type}:${channel.name}`

/**
 * Counted by type and name, so a public channel called `private-orders.1` stays
 * distinct from a private `orders.1`.
 */
export const createLiveChannelTracker = () => {
  const counts = new Map<string, number>()

  return {
    acquire(channel: LiveChannel): void {
      counts.set(liveChannelKey(channel), (counts.get(liveChannelKey(channel)) ?? 0) + 1)
    },

    /**
     * Drop a listener. Returns true when it was the last on the channel.
     */
    release(channel: LiveChannel): boolean {
      const remaining = (counts.get(liveChannelKey(channel)) ?? 1) - 1

      if (remaining > 0) {
        counts.set(liveChannelKey(channel), remaining)

        return false
      }

      counts.delete(liveChannelKey(channel))

      return true
    },

    hasAny(): boolean {
      return counts.size > 0
    },
  }
}
