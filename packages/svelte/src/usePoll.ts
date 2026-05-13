import { router, type PollOptions, type PollRequestOptionsResolver } from '@inertiajs/core'
import { onDestroy, onMount } from 'svelte'

export default function usePoll(
  interval: number,
  requestOptions: PollRequestOptionsResolver = {},
  options: PollOptions = {
    keepAlive: false,
    autoStart: true,
  },
) {
  const { stop, start } = router.poll(interval, requestOptions, {
    ...options,
    autoStart: false,
  })

  onMount(() => {
    if (options.autoStart ?? true) {
      start()
    }
  })

  onDestroy(() => {
    stop()
  })

  return { stop, start }
}
