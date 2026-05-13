import { PollOptions, PollRequestOptions, PollRequestOptionsResolver, ReloadOptions, router } from '@inertiajs/core'
import { useEffect, useRef } from 'react'

export default function usePoll(
  interval: number,
  requestOptions: PollRequestOptionsResolver = {},
  options: PollOptions = {
    keepAlive: false,
    autoStart: true,
  },
) {
  const isFunctionForm = typeof requestOptions === 'function'
  const hasInnerDataFn = !isFunctionForm && typeof (requestOptions as PollRequestOptions).data === 'function'

  const dynamicRef = useRef<(() => unknown) | null>(null)

  if (isFunctionForm) {
    dynamicRef.current = requestOptions as () => PollRequestOptions
  } else if (hasInnerDataFn) {
    dynamicRef.current = (requestOptions as PollRequestOptions).data as () => ReloadOptions['data']
  }

  const initialOptions: PollRequestOptionsResolver = isFunctionForm
    ? () => (dynamicRef.current as () => PollRequestOptions)()
    : hasInnerDataFn
      ? { ...(requestOptions as PollRequestOptions), data: () => (dynamicRef.current as () => ReloadOptions['data'])() }
      : requestOptions

  const pollRef = useRef(
    router.poll(interval, initialOptions, {
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
