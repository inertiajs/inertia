import { onDestroy, onMount } from 'svelte'
import { writable, type Readable } from 'svelte/store'
import { router, type VisitOptions } from '@inertiajs/core'

interface InertiaPrefetch {
  isPrefetched: boolean
  isPrefetching: boolean
  lastUpdatedAt: number | null
  flush: () => void
}

export default function usePrefetch(options: VisitOptions = {}): Readable<InertiaPrefetch> {
  const { subscribe, update } = writable<InertiaPrefetch>({
    isPrefetched: false,
    isPrefetching: false,
    lastUpdatedAt: null,
    flush() {
      router.flush(window.location.pathname, options)
    }
  })

  const cached = router.getCached(window.location.pathname, options)
  const inFlight = router.getPrefetching(window.location.pathname, options)

  update((state) => ({
    ...state,
    isPrefetched: cached !== null,
    isPrefetching: inFlight !== null,
    lastUpdatedAt: cached?.staleTimestamp || null,
  }))

  let removePrefetchedListener: () => void
  let removePrefetchingListener: () => void

  onMount(() => {
    removePrefetchingListener = router.on('prefetching', ({ detail }) => {
      if (detail.visit.url.pathname === window.location.pathname) {
        update((state) => ({ ...state, isPrefetching: true }))
      }
    })

    removePrefetchedListener = router.on('prefetched', ({ detail }) => {
      if (detail.visit.url.pathname === window.location.pathname) {
        update((state) => ({ ...state, isPrefetched: true, isPrefetching: false }))
      }
    })
  })

  onDestroy(() => {
    removePrefetchedListener()
    removePrefetchingListener()
  })

  return { subscribe }
}
