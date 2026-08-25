import { describe, expect, it } from 'vitest'
import { liveChannelName } from '../src/liveChannel'
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
