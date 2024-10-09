import { router, VisitOptions } from '@inertiajs/core'
import { useEffect, useState } from 'react'

export default function usePrefetch(options: VisitOptions = {}): {
  lastUpdatedAt: number | null
  isPrefetching: boolean
  isPrefetched: boolean
  flush: () => void
} {
  const cached = typeof window === 'undefined' ? null : router.getCached(window.location.pathname, options)
  const inFlight = typeof window === 'undefined' ? null : router.getPrefetching(window.location.pathname, options)

  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(cached?.staleTimestamp || null)
  const [isPrefetching, setIsPrefetching] = useState(inFlight !== null)
  const [isPrefetched, setIsPrefetched] = useState(cached !== null)

  useEffect(() => {
    const onPrefetchingListener = router.on('prefetching', (e) => {
      if (e.detail.visit.url.pathname === window.location.pathname) {
        setIsPrefetching(true)
      }
    })

    const onPrefetchedListener = router.on('prefetched', (e) => {
      if (e.detail.visit.url.pathname === window.location.pathname) {
        setIsPrefetching(false)
        setIsPrefetched(true)
        setLastUpdatedAt(e.detail.fetchedAt)
      }
    })

    return () => {
      onPrefetchedListener()
      onPrefetchingListener()
    }
  }, [])

  return {
    lastUpdatedAt,
    isPrefetching,
    isPrefetched,
    flush: () => router.flush(window.location.pathname, options),
  }
}
