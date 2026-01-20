import { SessionStorage } from './sessionStorage'

export const encryptHistory = async (data: any): Promise<ArrayBuffer> => {
  if (typeof window === 'undefined') {
    throw new Error('Unable to encrypt history')
  }

  const iv = getIv()
  const storedKey = await getKeyFromSessionStorage()
  const key = await getOrCreateKey(storedKey)

  if (!key) {
    throw new Error('Unable to encrypt history')
  }

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

const getIv = (): BufferSource => {
  const ivString = SessionStorage.get(historySessionStorageKeys.iv)

  if (ivString) {
    return new Uint8Array(ivString)
  }

  const iv = window.crypto.getRandomValues(new Uint8Array(12))

  SessionStorage.set(historySessionStorageKeys.iv, Array.from(iv))

  return iv
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
