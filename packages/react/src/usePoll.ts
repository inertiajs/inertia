import { PollOptions, ReloadOptions, router } from '@inertiajs/core'
import { useEffect, useRef } from 'react'

export default function usePoll(
  interval: number,
  requestOptions: ReloadOptions = {},
  options: PollOptions = {
    keepAlive: false,
    autoStart: true,
  },
) {
  const pollRef = useRef(
    router.poll(interval, requestOptions, {
      ...options,
      autoStart: false,
    }),
  )

  useEffect(() => {
    if (options.autoStart ?? true) {
      pollRef.current.start()
    }

    return () => pollRef.current.stop()
  }, [])

  return {
    stop: pollRef.current.stop,
    start: pollRef.current.start,
  }
}
