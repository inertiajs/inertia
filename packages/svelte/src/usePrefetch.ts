import { type VisitOptions } from 'inertiax-core'
import { getContext, onDestroy, onMount } from 'svelte'
import { readonly, writable } from 'svelte/store'

export default function usePrefetch(options: VisitOptions = {}) {
  const { router } = getContext('inertia')
  
  const isPrefetched = writable(false)
  const isPrefetching = writable(false)
  const lastUpdatedAt = writable<number | null>(null)

  const cached = router.getCached(window.location.pathname, options)
  const inFlight = router.getPrefetching(window.location.pathname, options)

  isPrefetched.set(cached !== null)
  isPrefetching.set(inFlight !== null)
  lastUpdatedAt.set(cached?.staleTimestamp || null)

  let removePrefetchedListener: () => void
  let removePrefetchingListener: () => void

  onMount(() => {
    removePrefetchingListener = router.on('prefetching', ({ detail }) => {
      if (detail.visit.url.pathname === window.location.pathname) {
        isPrefetching.set(true)
      }
    })

    removePrefetchedListener = router.on('prefetched', ({ detail }) => {
      if (detail.visit.url.pathname === window.location.pathname) {
        isPrefetched.set(true)
        isPrefetching.set(false)
      }
    })
  })

  onDestroy(() => {
    removePrefetchedListener()
    removePrefetchingListener()
  })

  return {
    isPrefetched: readonly(isPrefetched),
    isPrefetching: readonly(isPrefetching),
    lastUpdatedAt: readonly(lastUpdatedAt),
    flush() {
      router.flush(window.location.pathname, options)
    },
  }
}
