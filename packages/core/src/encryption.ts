const getIv = () => {
  const ivString = window.sessionStorage.getItem('iv')

  if (!ivString) {
    const iv = window.crypto.getRandomValues(new Uint8Array(12))
    window.sessionStorage.setItem('iv', JSON.stringify(Array.from(iv)))
    return iv
  }

  return new Uint8Array(JSON.parse(ivString))
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

export const encrypt = async (data: any): Promise<any> => {
  const start = Date.now()

  //   data = new Array(100).fill(data)

  const iv = getIv()

  return new Promise((resolve) => {
    const dbRequest = indexedDB.open('InertiaDatabase', 1)

    dbRequest.onupgradeneeded = function () {
      const db = dbRequest.result
      db.createObjectStore('history', { keyPath: 'id' })
    }

    dbRequest.onsuccess = function () {
      const db = dbRequest.result
      const transaction = db.transaction(['history'], 'readwrite')
      const objectStore = transaction.objectStore('history')
      const getRequest = objectStore.get(iv)

      getRequest.onsuccess = function () {
        const history = getRequest.result

        if (history) {
          //   console.log('got a key!', history)
          encryptData(iv, history.key, data).then((encrypted) => {
            // console.log('encrypted', encrypted)
            console.log('encrypted in', Date.now() - start)
            resolve(encrypted)
          })
        } else {
          // delete all keys
          const transaction = db.transaction(['history'], 'readwrite')
          const objectStore = transaction.objectStore('history')
          objectStore.clear()

          console.log('No key found, creating now')
          createKey().then((key) => {
            // console.log('created key', key)

            const transaction = db.transaction(['history'], 'readwrite')
            const objectStore = transaction.objectStore('history')
            objectStore.add({ id: iv, key })

            encryptData(iv, key, data).then((encrypted) => {
              //   console.log('encrypted', encrypted)
              console.log('encrypted in', Date.now() - start)
              resolve(encrypted)
            })
          })
        }
      }

      getRequest.onerror = function () {
        console.log('Error', getRequest.error)
      }
    }
  })
}

export const decrypt = async (data: any): Promise<any> => {
  const start = Date.now()
  const iv = getIv()

  return new Promise((resolve) => {
    const dbRequest = indexedDB.open('InertiaDatabase', 1)

    dbRequest.onupgradeneeded = function () {
      const db = dbRequest.result
      db.createObjectStore('history', { keyPath: 'id' })
    }

    dbRequest.onsuccess = function () {
      const db = dbRequest.result
      const transaction = db.transaction(['history'], 'readwrite')
      const objectStore = transaction.objectStore('history')
      const getRequest = objectStore.get(iv)

      getRequest.onsuccess = function () {
        const history = getRequest.result

        if (history) {
          //   console.log('got a key!', history)
          window.crypto.subtle
            .decrypt(
              {
                name: 'AES-GCM',
                iv,
              },
              history.key,
              data,
            )
            .then((decrypted) => {
              const decryptedText = new TextDecoder().decode(decrypted)
              console.log('decrypted in', Date.now() - start)
              resolve(JSON.parse(decryptedText))
            })
        } else {
          //   console.log('No history found')
        }
      }

      getRequest.onerror = function () {
        console.log('Error', getRequest.error)
      }
    }
  })
}

//   window.crypto.subtle
//     .generateKey(
//       {
//         name: 'AES-GCM',
//         length: 256,
//       },
//       true,
//       ['encrypt', 'decrypt'],
//     )
//     .then((key) => {
//       const iv = window.crypto.getRandomValues(new Uint8Array(12))
//       // store in sessionStorage
//       console.log(iv)
//       window.sessionStorage.setItem('iv', JSON.stringify(Array.from(iv)))
//       console.log(window.sessionStorage.getItem('iv'))
//       // restore iv
//       const ivString = window.sessionStorage.getItem('iv')
//       const iv2 = new Uint8Array(JSON.parse(ivString!))
//       console.log(iv2)
//       const toEncryptJson = JSON.stringify(new Array(100).fill(page))

//       window.crypto.subtle
//         .encrypt(
//           {
//             name: 'AES-GCM',
//             iv,
//           },
//           key,
//           new TextEncoder().encode(toEncryptJson),
//         )
//         .then((encrypted) => {
//           // console.log('encrypted', encrypted)

//           return window.crypto.subtle.decrypt(
//             {
//               name: 'AES-GCM',
//               iv,
//             },
//             key,
//             encrypted,
//           )
//         })
//         .then((decrypted) => {
//           // back to human-readable text
//           const decryptedText = new TextDecoder().decode(decrypted)
//           // console.log('decrypted', decryptedText)
//           console.log('time', Date.now() - start)
//         })
//       // console.log(key, key.toString())
//       // window.sessionStorage.setItem('asdf', key.toString())
//       // Add data to the database
//       // var request = indexedDB.open('myDatabase', 1)
//       // request.onsuccess = function (event) {
//       //   var db = event.target.result
//       //   var transaction = db.transaction(['customers'], 'readwrite')
//       //   var objectStore = transaction.objectStore('customers')
//       //   objectStore.add({ id: 2, name: 'hhu', email: 'john@example.com' })
//       // }
//       // console.log(window.sessionStorage.getItem('asdf'))
//     })
