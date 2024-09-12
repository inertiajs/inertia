export const encrypt = async (data: any): Promise<any> => {
  const iv = getIv()
  const history = await getHistoryFromDb(iv)
  const key = await getOrCreateKey(iv, history)
  const encrypted = await encryptData(iv, key, data)

  return encrypted
}

export const decrypt = async (data: any): Promise<any> => {
  const iv = getIv()
  const history = await getHistoryFromDb(iv)

  if (!history) {
    return null
  }

  //   try {
  return await decryptData(iv, history.key, data)
  //   } catch (e) {
  //     return null
  //   }
}

const encryptData = async (iv: Uint8Array, key: CryptoKey, data: any) => {
  return window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    new TextEncoder().encode(JSON.stringify(data)),
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
  const ivString = window.sessionStorage.getItem('iv')

  if (ivString) {
    return new Uint8Array(JSON.parse(ivString))
  }

  const iv = window.crypto.getRandomValues(new Uint8Array(12))

  window.sessionStorage.setItem('iv', JSON.stringify(Array.from(iv)))

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

const clearAllKeys = async () => {
  const db = await getDb()

  const transaction = db.transaction(['history'], 'readwrite')
  const objectStore = transaction.objectStore('history')

  objectStore.clear()
}

const getDb = async (): Promise<IDBDatabase> => {
  return new Promise((resolve) => {
    const dbRequest = indexedDB.open('InertiaDatabase', 1)

    dbRequest.onupgradeneeded = function () {
      dbRequest.result.createObjectStore('history', { keyPath: 'id' })
    }

    dbRequest.onsuccess = function () {
      resolve(dbRequest.result)
    }

    dbRequest.onerror = function (...args) {
      console.error('got an error!!', args)
      //
    }
  })
}

const saveKey = async (iv: Uint8Array, key: CryptoKey) => {
  const db = await getDb()

  const transaction = db.transaction(['history'], 'readwrite')
  const objectStore = transaction.objectStore('history')

  objectStore.add({ id: iv.toString(), key })
}

const getOrCreateKey = async (iv: Uint8Array, history: { key: CryptoKey } | null) => {
  if (history) {
    return history.key
  }

  await clearAllKeys()

  const key = await createKey()

  window.crypto.subtle.exportKey('raw', key).then((keyData) => {
    // window.sessionStorage.setItem('key', JSON.stringify(Array.from(new Uint8Array(keyData))))
    const storable = JSON.stringify(Array.from(new Uint8Array(keyData)))
    console.log('keyData', keyData)

    window.crypto.subtle
      .importKey(
        'raw',
        new Uint8Array(JSON.parse(storable)),
        {
          name: 'AES-GCM',
          length: 256,
        },
        true,
        ['encrypt', 'decrypt'],
      )
      .then((importedKey) => {
        console.log('importedKey', importedKey)
      })
  })

  await saveKey(iv, key)

  return key
}

const getHistoryFromDb = async (
  iv: Uint8Array,
): Promise<{
  key: CryptoKey
} | null> => {
  const db = await getDb()

  return new Promise((resolve) => {
    const transaction = db.transaction(['history'], 'readonly')
    const objectStore = transaction.objectStore('history')
    const getRequest = objectStore.get(iv.toString())

    getRequest.onsuccess = function () {
      resolve(getRequest.result)
    }

    getRequest.onerror = function (...args) {
      console.error('got an error...', args)
    }
  })
}
