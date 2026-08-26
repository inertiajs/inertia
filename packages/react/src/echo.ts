import type { LiveOptions } from '@inertiajs/core'
import { echoLive, type EchoInstance, type EchoOptions } from '@inertiajs/core/echo'
import { echo as resolveEcho, echoIsConfigured } from '@laravel/echo-react'

export type { EchoOptions }

/**
 * Delivers live prop updates over the Echo instance `configureEcho()` from
 * `@laravel/echo-react` set up.
 */
export const echo = (options: EchoOptions = {}): LiveOptions =>
  echoLive({ echo: resolveEcho as () => EchoInstance, echoIsConfigured }, options)
