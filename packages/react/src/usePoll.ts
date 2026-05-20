import { PollOptions, ReloadOptions, router } from '@inertiajs/core'
import { useEffect, useRef } from 'react'

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

  const pollRef = useRef<ReturnType<typeof router.poll> | null>(null)

  useEffect(() => {
    pollRef.current = router.poll(
      interval,
      typeof requestOptions === 'function' ? () => (latest.current as () => ReloadOptions)() : requestOptions,
      { ...options, autoStart: options.autoStart ?? true },
    )

    return () => pollRef.current?.destroy()
  }, [])

  return {
    stop: () => pollRef.current?.stop(),
    start: () => pollRef.current?.start(),
  }
}
