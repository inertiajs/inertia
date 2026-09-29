import { PollOptions, ReloadOptions, router } from '@inertiajs/core'
import { useCallback, useEffect, useRef, useState } from 'react'

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

  const [polling, setPolling] = useState(options.autoStart ?? true)

  useEffect(() => {
    pollRef.current = router.poll(
      interval,
      typeof requestOptions === 'function' ? () => (latest.current as () => ReloadOptions)() : requestOptions,
      { ...options, autoStart: options.autoStart ?? true },
    )

    return () => pollRef.current?.destroy()
  }, [])

  const stop = useCallback(() => {
    pollRef.current?.stop()
    setPolling(false)
  }, [])

  const start = useCallback(() => {
    pollRef.current?.start()
    setPolling(true)
  }, [])

  return {
    stop,
    start,
    polling,
  }
}
