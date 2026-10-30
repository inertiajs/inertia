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
 * A rejected subscription leaves its props quietly stale, so it is worth a
 * warning even though there is nothing to recover.
 */
export const warnRejectedLiveChannel = (name: string, reason?: unknown): void => {
  console.warn(`Inertia could not subscribe to the live channel "${name}".`, ...(reason === undefined ? [] : [reason]))
}

/**
 * Counted by the name the broadcaster files a channel under, since that is what
 * it joins and leaves. A public `private-orders.1` and a private `orders.1` are
 * one channel to Echo and Pusher, so they share a count.
 */
export const createLiveChannelTracker = () => {
  const counts = new Map<string, number>()

  return {
    /**
     * Add a listener. Returns true when it is the first on the channel.
     */
    acquire(channel: LiveChannel): boolean {
      const name = liveChannelName(channel)
      const count = (counts.get(name) ?? 0) + 1

      counts.set(name, count)

      return count === 1
    },

    /**
     * Drop a listener. Returns true when it was the last on the channel.
     */
    release(channel: LiveChannel): boolean {
      const name = liveChannelName(channel)
      const remaining = (counts.get(name) ?? 1) - 1

      if (remaining > 0) {
        counts.set(name, remaining)

        return false
      }

      counts.delete(name)

      return true
    },

    hasAny(): boolean {
      return counts.size > 0
    },
  }
}
