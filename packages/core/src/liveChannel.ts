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
