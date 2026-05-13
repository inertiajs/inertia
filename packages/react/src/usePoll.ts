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
  const isFunctionForm = typeof requestOptions === 'function'

  const latestFn = useRef<(() => ReloadOptions) | null>(null)
  latestFn.current = isFunctionForm ? requestOptions : null

  const pollRef = useRef<ReturnType<typeof router.poll> | null>(null)

  if (pollRef.current === null) {
    const resolved: ReloadOptions | (() => ReloadOptions) = isFunctionForm ? () => latestFn.current!() : requestOptions

    pollRef.current = router.poll(interval, resolved, {
      ...options,
      autoStart: false,
    })
  }

  useEffect(() => {
    if (options.autoStart ?? true) {
      pollRef.current!.start()
    }

    return () => pollRef.current!.stop()
  }, [])

  return {
    stop: pollRef.current.stop,
    start: pollRef.current.start,
  }
}
