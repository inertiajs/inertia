import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { configureLive, throttleWait } from '../src/live'
import type { LiveTransport } from '../src/types'

describe('throttleWait', () => {
  it('owes nothing when the prop has never been flushed', () => {
    expect(throttleWait(1000, undefined, 5_000)).toBe(0)
  })

  it('owes the remainder of the window while it is still running', () => {
    expect(throttleWait(1000, 5_000, 5_400)).toBe(600)
    expect(throttleWait(5000, 5_000, 6_500)).toBe(3500)
  })

  it('owes nothing once the window has elapsed', () => {
    expect(throttleWait(1000, 5_000, 6_000)).toBe(0)
    expect(throttleWait(1000, 5_000, 9_000)).toBe(0)
  })

  it('owes the whole window the instant a prop is flushed', () => {
    expect(throttleWait(1000, 5_000, 5_000)).toBe(1000)
  })
})

describe('configureLive', () => {
  const fakeTransport = (): LiveTransport => ({
    subscribe: vi.fn(() => () => {}),
    socketId: () => 'socket-id',
    onStatusChange: vi.fn(() => () => {}),
  })

  beforeEach(() => {
    vi.stubGlobal('window', { setTimeout, clearTimeout, location: new URL('http://localhost/') })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('ignores a second transport, since the listeners it registered cannot be torn down', () => {
    const first = fakeTransport()
    const second = fakeTransport()

    configureLive(first)
    configureLive(second)

    expect(first.onStatusChange).toHaveBeenCalledTimes(1)
    expect(second.onStatusChange).not.toHaveBeenCalled()
  })
})
