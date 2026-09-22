import { router, type PollOptions, type ReloadOptions } from '@inertiajs/core'
import { onDestroy, onMount } from 'svelte'

export default function usePoll(
  interval: number,
  requestOptions: ReloadOptions | (() => ReloadOptions) = {},
  options: PollOptions = {
    keepAlive: false,
    autoStart: true,
  },
) {
  const autoStart = options.autoStart ?? true

  const { stop, start, destroy } = router.poll(interval, requestOptions, {
    ...options,
    autoStart: false,
  })

  let polling = $state(autoStart)

  onMount(() => {
    if (autoStart) {
      start()
    }
  })

  onDestroy(() => {
    destroy()
  })

  return {
    get polling() {
      return polling
    },
    stop() {
      stop()
      polling = false
    },
    start() {
      start()
      polling = true
    },
  }
}
