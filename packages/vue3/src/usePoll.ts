import { PollOptions, ReloadOptions, router } from '@inertiajs/core'
import { onMounted, onUnmounted } from 'vue'

export default function usePoll(
  interval: number,
  requestOptions: ReloadOptions | (() => ReloadOptions) = {},
  options: PollOptions = {
    keepAlive: false,
    autoStart: true,
  },
): {
  stop: VoidFunction
  start: VoidFunction
} {
  const { stop, start, destroy } = router.poll(interval, requestOptions, {
    ...options,
    autoStart: false,
  })

  onMounted(() => {
    if (options.autoStart ?? true) {
      start()
    }
  })

  onUnmounted(() => {
    destroy()
  })

  return {
    stop,
    start,
  }
}
