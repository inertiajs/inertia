import { PollOptions, ReloadOptions, router } from '@inertiajs/core'
import { useEffect } from 'react'

export default function usePoll(interval: number, requestOptions: ReloadOptions = {}, options: PollOptions = {}) {
  const { stop, start } = router.poll(interval, requestOptions, {
    ...options,
    autoStart: false,
  })

  useEffect(() => {
    if (options.autoStart) {
      start()
    }

    return () => stop()
  }, [])

  return {
    stop,
    start,
  }
}
