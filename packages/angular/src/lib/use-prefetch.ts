import { DestroyRef, inject, signal, type Signal } from '@angular/core'
import { router, type VisitOptions } from '@inertiajs/core'

// Resolved on every read rather than captured once: a component that survives a visit
// (preserved page, persistent layout) must track the URL it is currently rendered at,
// which is what the React and Vue adapters do by reading `window.location` in the handler.
function currentPathname(): string | null {
  return typeof window === 'undefined' ? null : window.location.pathname
}

export function usePrefetch(options: VisitOptions = {}): {
  lastUpdatedAt: Signal<number | null>
  isPrefetching: Signal<boolean>
  isPrefetched: Signal<boolean>
  flush: () => void
} {
  const destroyRef = inject(DestroyRef)
  const initialPath = currentPathname()
  const cached = initialPath === null ? null : router.getCached(initialPath, options)
  const inFlight = initialPath === null ? null : router.getPrefetching(initialPath, options)
  const lastUpdatedAt = signal<number | null>(cached?.staleTimestamp ?? null)
  const isPrefetching = signal(inFlight !== null)
  const isPrefetched = signal(cached !== null)

  if (initialPath !== null) {
    const stopPrefetching = router.on('prefetching', (event) => {
      if (event.detail.visit.url.pathname === currentPathname()) {
        isPrefetching.set(true)
      }
    })
    const stopPrefetched = router.on('prefetched', (event) => {
      if (event.detail.visit.url.pathname === currentPathname()) {
        isPrefetching.set(false)
        isPrefetched.set(true)
        lastUpdatedAt.set(event.detail.fetchedAt)
      }
    })

    destroyRef.onDestroy(() => {
      stopPrefetching()
      stopPrefetched()
    })
  }

  return {
    lastUpdatedAt: lastUpdatedAt.asReadonly(),
    isPrefetching: isPrefetching.asReadonly(),
    isPrefetched: isPrefetched.asReadonly(),
    flush: () => {
      const path = currentPathname()

      if (path === null) {
        return
      }

      router.flush(path, options)
      isPrefetched.set(false)
      lastUpdatedAt.set(null)
    },
  }
}
