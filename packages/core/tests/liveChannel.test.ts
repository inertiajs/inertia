import { describe, expect, it } from 'vitest'
import { createLiveChannelTracker, liveChannelName } from '../src/liveChannel'
import type { LiveChannel } from '../src/types'

const channel = (type: LiveChannel['type'], name = 'orders.1'): LiveChannel => ({ name, type })

describe('liveChannelName', () => {
  it('applies the prefix the broadcaster files each channel type under', () => {
    expect(liveChannelName(channel('public'))).toBe('orders.1')
    expect(liveChannelName(channel('private'))).toBe('private-orders.1')
    expect(liveChannelName(channel('presence'))).toBe('presence-orders.1')
    expect(liveChannelName(channel('encrypted-private'))).toBe('private-encrypted-orders.1')
  })

  it('leaves a public name that already looks prefixed alone', () => {
    expect(liveChannelName(channel('public', 'private-orders.1'))).toBe('private-orders.1')
  })

  it('falls back to no prefix for a type it does not know', () => {
    expect(liveChannelName({ name: 'orders.1', type: 'shouted' } as unknown as LiveChannel)).toBe('orders.1')
  })
})

describe('createLiveChannelTracker', () => {
  const tracker = () => createLiveChannelTracker()

  it('reports the last listener off a channel, not the ones before it', () => {
    const channels = tracker()

    channels.acquire(channel('private'))
    channels.acquire(channel('private'))

    expect(channels.release(channel('private'))).toBe(false)
    expect(channels.hasAny()).toBe(true)

    expect(channels.release(channel('private'))).toBe(true)
    expect(channels.hasAny()).toBe(false)
  })

  it('counts channels the broadcaster files under the same name as one', () => {
    const channels = tracker()

    expect(channels.acquire(channel('public', 'private-orders.1'))).toBe(true)
    expect(channels.acquire(channel('private', 'orders.1'))).toBe(false)

    expect(channels.release(channel('public', 'private-orders.1'))).toBe(false)
    expect(channels.release(channel('private', 'orders.1'))).toBe(true)
    expect(channels.hasAny()).toBe(false)
  })

  it('keeps channels of different types apart when their names differ on the wire', () => {
    const channels = tracker()

    channels.acquire(channel('private'))
    channels.acquire(channel('presence'))

    expect(channels.release(channel('private'))).toBe(true)
    expect(channels.hasAny()).toBe(true)
  })

  it('treats releasing an unknown channel as the last one out', () => {
    expect(tracker().release(channel('private'))).toBe(true)
  })
})
