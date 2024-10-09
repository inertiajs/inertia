import { SessionStorage } from './sessionStorage'

export const encryptHistory = async (data: any): Promise<ArrayBuffer> => {
  if (typeof window === 'undefined') {
    throw new Error('Unable to encrypt history')
  }

  const iv = getIv()
  const storedKey = await getKeyFromSessionStorage()
  const key = await getOrCreateKey(storedKey)
  const encrypted = await encryptData(iv, key, data)

  return encrypted
}

export const historySessionStorageKeys = {
  key: 'historyKey',
  iv: 'historyIv',
}

export const decryptHistory = async (data: any): Promise<any> => {
  const iv = getIv()
  const storedKey = await getKeyFromSessionStorage()

  if (!storedKey) {
    throw new Error('Unable to decrypt history')
  }

  return await decryptData(iv, storedKey, data)
}

const encryptData = async (iv: Uint8Array, key: CryptoKey, data: any) => {
  if (typeof window === 'undefined') {
    throw new Error('Unable to encrypt history')
  }

  const textEncoder = new TextEncoder()
  const str = JSON.stringify(data)
  const encoded = new Uint8Array(str.length)

  textEncoder.encodeInto(str, encoded)

  return window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    encoded,
  )
}

const decryptData = async (iv: Uint8Array, key: CryptoKey, data: any) => {
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

const getIv = () => {
  const ivString = SessionStorage.get(historySessionStorageKeys.iv)

  if (ivString) {
    return new Uint8Array(ivString)
  }

  const iv = window.crypto.getRandomValues(new Uint8Array(12))

  SessionStorage.set(historySessionStorageKeys.iv, Array.from(iv))

  return iv
}

const createKey = async () => {
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
  const keyData = await window.crypto.subtle.exportKey('raw', key)

  SessionStorage.set(historySessionStorageKeys.key, Array.from(new Uint8Array(keyData)))
}

const getOrCreateKey = async (key: CryptoKey | null) => {
  if (key) {
    return key
  }

  const newKey = await createKey()

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