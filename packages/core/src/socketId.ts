import { http } from './http'
import { SocketIdResolver } from './types'

let resolver: SocketIdResolver | null = null
let configured = false

/**
 * Send the socket id with every Inertia request unless the caller already set
 * `X-Socket-Id`, in any casing.
 */
http.onRequest((config) => {
  const current = socketId.resolve()
  const headers = config.headers ?? {}
  const alreadySet = Object.keys(headers).some((header) => header.toLowerCase() === 'x-socket-id')

  if (current && !alreadySet) {
    config.headers = { ...headers, 'X-Socket-Id': current }
  }

  return config
})

export const socketId = {
  /**
   * Pass `null` to stop sending the socket id along with requests.
   */
  resolveUsing(callback: SocketIdResolver | null): void {
    resolver = callback
    configured = true
  },

  /**
   * Register a resolver for an app that has not chosen one itself, whichever
   * order the two happen in. Clearing one with `null` counts as choosing.
   */
  resolveUsingDefault(callback: SocketIdResolver): void {
    if (configured || resolver !== null) {
      return
    }

    resolver = callback
  },

  resolve(): string | null {
    return resolver?.() || null
  },
}
