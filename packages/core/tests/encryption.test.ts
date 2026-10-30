import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { decryptHistory, encryptHistory, historySessionStorageKeys } from '../src/encryption'

const page = { component: 'Users/Show', props: { name: 'John Doe', emoji: '😃' }, url: '/users/1', version: null }

describe('history encryption', () => {
  let storage: Map<string, string>

  beforeEach(() => {
    storage = new Map()

    vi.stubGlobal('window', {
      crypto: globalThis.crypto,
      sessionStorage: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => storage.set(key, value),
        removeItem: (key: string) => storage.delete(key),
      },
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('decrypts what it encrypted', async () => {
    expect(await decryptHistory(await encryptHistory(page))).toEqual(page)
  })

  it('gives every entry its own IV', async () => {
    const first = new Uint8Array(await encryptHistory(page))
    const second = new Uint8Array(await encryptHistory(page))

    expect(first.subarray(0, 12)).not.toEqual(second.subarray(0, 12))
    expect(first.subarray(12)).not.toEqual(second.subarray(12))
    expect(storage.has(historySessionStorageKeys.iv)).toBe(false)
  })

  it('does not decrypt entries from earlier versions that used a shared IV', async () => {
    await encryptHistory(page)

    const rawKey = new Uint8Array(JSON.parse(storage.get(historySessionStorageKeys.key)!))
    const key = await crypto.subtle.importKey('raw', rawKey, 'AES-GCM', false, ['encrypt'])
    const sharedIv = crypto.getRandomValues(new Uint8Array(12))
    const legacyEntry = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: sharedIv },
      key,
      new TextEncoder().encode(JSON.stringify(page)),
    )

    storage.set(historySessionStorageKeys.iv, JSON.stringify(Array.from(sharedIv)))

    await expect(decryptHistory(legacyEntry)).rejects.toThrow()
  })

  it('starts a new key when an earlier version left a shared IV behind', async () => {
    const earlierEntry = await encryptHistory(page)
    const earlierKey = storage.get(historySessionStorageKeys.key)

    storage.set(historySessionStorageKeys.iv, JSON.stringify(Array.from(crypto.getRandomValues(new Uint8Array(12)))))

    const entry = await encryptHistory(page)

    expect(storage.get(historySessionStorageKeys.key)).not.toBe(earlierKey)
    expect(storage.has(historySessionStorageKeys.iv)).toBe(false)
    expect(await decryptHistory(entry)).toEqual(page)
    await expect(decryptHistory(earlierEntry)).rejects.toThrow()
  })

  it('does not decrypt entries after the key has been cleared', async () => {
    const entry = await encryptHistory(page)

    storage.delete(historySessionStorageKeys.key)

    await expect(decryptHistory(entry)).rejects.toThrow('Unable to decrypt history')
  })
})
