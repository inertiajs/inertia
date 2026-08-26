import { http } from './http'
import { SocketIdResolver } from './types'

let resolver: SocketIdResolver | null = null

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
  },

  resolve(): string | null {
    return resolver?.() || null
  },
}
