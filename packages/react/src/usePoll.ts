import { PollOptions, ReloadOptions, router } from '@inertiajs/core'
import { useCallback, useEffect, useRef } from 'react'

export default function usePoll(
  interval: number,
  requestOptions: ReloadOptions | (() => ReloadOptions) = {},
  options: PollOptions = {
    keepAlive: false,
    autoStart: true,
  },
) {
  const latest = useRef(requestOptions)
  latest.current = requestOptions

  const handleRef = useRef<ReturnType<typeof router.poll> | null>(null)

  useEffect(() => {
    const resolved: ReloadOptions | (() => ReloadOptions) =
      typeof requestOptions === 'function' ? () => (latest.current as () => ReloadOptions)() : requestOptions

    const handle = router.poll(interval, resolved, {
      ...options,
      autoStart: options.autoStart ?? true,
    })

    handleRef.current = handle

    return () => {
      handle.destroy()
      handleRef.current = null
    }
  }, [])

  const stop = useCallback(() => handleRef.current?.stop(), [])
  const start = useCallback(() => handleRef.current?.start(), [])

  return { stop, start }
}
