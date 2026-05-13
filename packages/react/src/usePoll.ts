import { PollOptions, PollRequestOptionsResolver, router } from '@inertiajs/core'
import { useEffect, useRef } from 'react'

export default function usePoll(
  interval: number,
  requestOptions: PollRequestOptionsResolver = {},
  options: PollOptions = {
    keepAlive: false,
    autoStart: true,
  },
) {
  const requestOptionsRef = useRef(requestOptions)
  requestOptionsRef.current = requestOptions

  const pollRef = useRef(
    router.poll(
      interval,
      () => {
        const current = requestOptionsRef.current
        return typeof current === 'function' ? current() : current
      },
      {
        ...options,
        autoStart: false,
      },
    ),
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
