import { PollOptions, ReloadOptions } from '@inertiajs/core'
import { router } from '@inertiajs/vue3'
import { onMounted, onUnmounted } from 'vue'

export default function usePoll(
  interval: number,
  requestOptions: ReloadOptions = {},
  options: PollOptions & {
    startOnMount?: boolean
  } = {
    keepAlive: false,
    startOnMount: true,
  },
): {
  stop: VoidFunction
  start: VoidFunction
} {
  let stopFunc: VoidFunction

  options.startOnMount ??= true

  const stop = () => {
    if (stopFunc) {
      stopFunc()
    }
  }

  const start = () => {
    stop()
    stopFunc = router.poll(interval, requestOptions, options)
  }

  onMounted(() => {
    if (options.startOnMount) {
      start()
    }
  })

  onUnmounted(() => {
    stop()
  })

  return {
    stop,
    start,
  }
}
