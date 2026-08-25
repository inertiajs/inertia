import type { LiveTransport } from '@inertiajs/core'
import { createEchoTransport, type EchoInstanceLike } from '@inertiajs/core/echo'
import { echo, echoIsConfigured } from '@laravel/echo-vue'

export type EchoTransportOptions = {
  /**
   * Resolve the Echo instance yourself, instead of the one `configureEcho()`
   * from `@laravel/echo-vue` set up.
   */
  echo?: () => EchoInstanceLike
}

/**
 * Delivers live prop updates over the Echo instance `configureEcho()` set up.
 */
export const echoTransport = (options: EchoTransportOptions = {}): LiveTransport => {
  if (options.echo) {
    return createEchoTransport({ echo: options.echo, echoIsConfigured: () => true })
  }

  return createEchoTransport({ echo: echo as () => EchoInstanceLike, echoIsConfigured })
}
