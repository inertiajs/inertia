import { ReloadOptions, VoidFunction } from '@inertiajs/core'
import { router } from '@inertiajs/vue3'
import { onMounted, onUnmounted } from 'vue'

export default function usePoll(interval: number, options: ReloadOptions, startOnMount = true): VoidFunction {
  let stopFunc: VoidFunction

  let stop = () => {
    if (stopFunc) {
      stopFunc()
    }
  }

  let start = () => {
    stop()
    stopFunc = router.poll(interval, options)
  }

  onMounted(() => {
    if (startOnMount) {
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
