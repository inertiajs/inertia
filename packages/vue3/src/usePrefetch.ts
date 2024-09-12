import { router, VisitOptions } from '@inertiajs/core'
import { onMounted, onUnmounted, ref, Ref } from 'vue'

export default function usePrefetch(options: VisitOptions = {}): {
  lastUpdatedAt: Ref<number | null>
  isPrefetching: Ref<boolean>
  isPrefetched: Ref<boolean>
  flush: () => void
} {
  const isPrefetching = ref(false)
  const lastUpdatedAt = ref<number | null>(null)
  const isPrefetched = ref(false)

  const cached = router.getCached(window.location.pathname, options)
  const inFlight = router.getPrefetching(window.location.pathname, options)

  lastUpdatedAt.value = cached?.timestamp || null

  isPrefetching.value = inFlight !== null
  isPrefetched.value = cached !== null

  let onPrefetchedListener
  let onPrefetchingListener

  onMounted(() => {
    onPrefetchingListener = router.on('prefetching', (e) => {
      if (e.detail.visit.url.pathname === window.location.pathname) {
        isPrefetching.value = true
      }
    })

    onPrefetchedListener = router.on('prefetched', (e) => {
      if (e.detail.response.url === window.location.pathname) {
        isPrefetching.value = false
        isPrefetched.value = true
      }
    })
  })

  onUnmounted(() => {
    onPrefetchedListener()
    onPrefetchingListener()
  })

  return {
    lastUpdatedAt,
    isPrefetching,
    isPrefetched,
    flush: () => router.flush(window.location.pathname, options),
  }
}
