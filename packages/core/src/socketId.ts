import { http } from './http'
import { SocketIdResolver } from './types'
import { isSameOrigin } from './url'

let resolver: SocketIdResolver | null = null
let configured = false

/**
 * Send the socket id with every same-origin Inertia request unless the caller
 * already set `X-Socket-Id`, in any casing. Another origin has no use for it,
 * and a custom header there costs a CORS preflight it may reject.
 */
http.onRequest((config) => {
  const current = socketId.resolve()
  const headers = config.headers ?? {}
  const alreadySet = Object.keys(headers).some((header) => header.toLowerCase() === 'x-socket-id')

  if (current && !alreadySet && isSameOrigin(config.url)) {
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
