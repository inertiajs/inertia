import { SessionStorage } from './sessionStorage'

const ivLength = 12

export const encryptHistory = async (data: any): Promise<ArrayBuffer> => {
  if (typeof window === 'undefined') {
    throw new Error('Unable to encrypt history')
  }

  // A shared IV means an earlier version encrypted entries in this tab, so we start
  // over with a key that has never been used with a repeated IV.
  if (SessionStorage.exists(historySessionStorageKeys.iv)) {
    SessionStorage.remove(historySessionStorageKeys.key)
    SessionStorage.remove(historySessionStorageKeys.iv)
  }

  const storedKey = await getKeyFromSessionStorage()
  const key = await getOrCreateKey(storedKey)

  if (!key) {
    throw new Error('Unable to encrypt history')
  }

  // AES-GCM must never reuse an IV under the same key, so every entry gets
  // its own, stored in front of the ciphertext for decryption.
  const iv = window.crypto.getRandomValues(new Uint8Array(ivLength))
  const encrypted = new Uint8Array(await encryptData(iv, key, data))
  const entry = new Uint8Array(iv.length + encrypted.length)

  entry.set(iv)
  entry.set(encrypted, iv.length)

  return entry.buffer
}

export const historySessionStorageKeys = {
  key: 'historyKey',
  iv: 'historyIv',
}

export const decryptHistory = async (data: ArrayBuffer): Promise<any> => {
  const storedKey = await getKeyFromSessionStorage()

  if (!storedKey) {
    throw new Error('Unable to decrypt history')
  }

  // Entries from earlier versions have no IV in front of the ciphertext, so they fail
  // the AES-GCM tag check here and are fetched from the server again instead.
  const entry = new Uint8Array(data)

  return await decryptData(entry.subarray(0, ivLength), storedKey, entry.subarray(ivLength))
}

const encryptData = async (iv: BufferSource, key: CryptoKey, data: any) => {
  if (typeof window === 'undefined') {
    throw new Error('Unable to encrypt history')
  }

  if (typeof window.crypto.subtle === 'undefined') {
    console.warn('Encryption is not supported in this environment. SSL is required.')

    return Promise.resolve(data)
  }

  const textEncoder = new TextEncoder()
  const str = JSON.stringify(data)
  const encoded = new Uint8Array(str.length * 3)

  const result = textEncoder.encodeInto(str, encoded)

  return window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    encoded.subarray(0, result.written),
  )
}

const decryptData = async (iv: BufferSource, key: CryptoKey, data: any) => {
  if (typeof window.crypto.subtle === 'undefined') {
    console.warn('Decryption is not supported in this environment. SSL is required.')

    return Promise.resolve(data)
  }

  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    data,
  )

  return JSON.parse(new TextDecoder().decode(decrypted))
}

const createKey = async () => {
  if (typeof window.crypto.subtle === 'undefined') {
    console.warn('Encryption is not supported in this environment. SSL is required.')

    return Promise.resolve(null)
  }

  return window.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt'],
  )
}

const saveKey = async (key: CryptoKey) => {
  if (typeof window.crypto.subtle === 'undefined') {
    console.warn('Encryption is not supported in this environment. SSL is required.')

    return Promise.resolve()
  }

  const keyData = await window.crypto.subtle.exportKey('raw', key)

  SessionStorage.set(historySessionStorageKeys.key, Array.from(new Uint8Array(keyData)))
}

const getOrCreateKey = async (key: CryptoKey | null) => {
  if (key) {
    return key
  }

  const newKey = await createKey()

  if (!newKey) {
    return null
  }

  await saveKey(newKey)

  return newKey
}

const getKeyFromSessionStorage = async (): Promise<CryptoKey | null> => {
  const stringKey = SessionStorage.get(historySessionStorageKeys.key)

  if (!stringKey) {
    return null
  }

  const key = await window.crypto.subtle.importKey(
    'raw',
    new Uint8Array(stringKey),
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt'],
  )

  return key
}
