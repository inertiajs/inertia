import type { LiveOptions } from '@inertiajs/core'
import { createEchoTransport, type EchoInstance } from '@inertiajs/core/echo'
import { echo as resolveEcho, echoIsConfigured } from '@laravel/echo-react'

export type EchoOptions = {
  throttle?: number
  pauseWhenHidden?: boolean

  /**
   * Resolve the Echo instance yourself, instead of the one `configureEcho()`
   * from `@laravel/echo-react` set up.
   */
  resolve?: () => EchoInstance
}

/**
 * Delivers live prop updates over the Echo instance `configureEcho()` set up.
 */
export const echo = ({ resolve, ...options }: EchoOptions = {}): LiveOptions => {
  const transport = createEchoTransport({
    echo: resolve ?? (resolveEcho as () => EchoInstance),
    echoIsConfigured: resolve ? () => true : echoIsConfigured,
  })

  return { transport, ...options }
}
