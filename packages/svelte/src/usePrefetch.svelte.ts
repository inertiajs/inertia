import { router, type VisitOptions } from '@inertiajs/core'
import { onDestroy, onMount } from 'svelte'

export default function usePrefetch(options: VisitOptions = {}) {
  let isPrefetched = $state(false)
  let isPrefetching = $state(false)
  let lastUpdatedAt = $state<number | null>(null)

  const cached = typeof window === 'undefined' ? null : router.getCached(window.location.pathname, options)
  const inFlight = typeof window === 'undefined' ? null : router.getPrefetching(window.location.pathname, options)

  isPrefetched = cached !== null
  isPrefetching = inFlight !== null
  lastUpdatedAt = cached?.staleTimestamp || null

  let removePrefetchedListener: () => void
  let removePrefetchingListener: () => void

  onMount(() => {
    removePrefetchingListener = router.on('prefetching', ({ detail }) => {
      if (detail.visit.url.pathname === window.location.pathname) {
        isPrefetching = true
      }
    })

    removePrefetchedListener = router.on('prefetched', ({ detail }) => {
      if (detail.visit.url.pathname === window.location.pathname) {
        isPrefetched = true
        isPrefetching = false
      }
    })
  })

  onDestroy(() => {
    if (removePrefetchedListener) {
      removePrefetchedListener()
    }

    if (removePrefetchingListener) {
      removePrefetchingListener()
    }
  })

  return {
    get isPrefetched() {
      return isPrefetched
    },
    get isPrefetching() {
      return isPrefetching
    },
    get lastUpdatedAt() {
      return lastUpdatedAt
    },
    flush() {
      router.flush(window.location.pathname, options)
    },
  }
}
