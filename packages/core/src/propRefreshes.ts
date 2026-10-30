import { get } from 'es-toolkit/compat'
import { RefreshFilter, visitRefreshesProp } from './partialReload'
import { InternalActiveVisit, Page } from './types'
import { isSameUrlWithoutQueryOrHash } from './url'

const PENDING_DEFERRED = 'pending-deferred'

const activeVisits = new Map<string, RefreshFilter>()
const listeners = new Set<VoidFunction>()

const notify = (): void => {
  listeners.forEach((listener) => listener())
}

/**
 * Prefetches and requests aimed at another page are ignored, since neither
 * refreshes the props you're looking at.
 */
export const trackPropRefresh = (visit: InternalActiveVisit): void => {
  if (typeof window === 'undefined' || visit.prefetch) {
    return
  }

  if (!isSameUrlWithoutQueryOrHash(visit.url, window.location)) {
    return
  }

  // The request that loads the deferred props claims them from here on
  if (visit.deferredProps) {
    activeVisits.delete(PENDING_DEFERRED)
  }

  activeVisits.set(visit.id, { only: visit.only, except: visit.except, reset: visit.reset })

  notify()
}

/**
 * Deferred props are only requested once their page has rendered, so the ones
 * a page is about to load count as refreshing until that request takes over.
 */
export const trackPendingDeferredProps = (page: Page, deferredProps: Page['deferredProps']): void => {
  if (typeof window === 'undefined') {
    return
  }

  const pending = Object.values(deferredProps ?? {})
    .flat()
    .filter((prop) => get(page.props, prop) === undefined)

  if (pending.length > 0) {
    activeVisits.set(PENDING_DEFERRED, { only: pending, except: [], reset: [] })
    notify()
  } else if (activeVisits.delete(PENDING_DEFERRED)) {
    notify()
  }
}

export const untrackPropRefresh = (visit: InternalActiveVisit): void => {
  if (activeVisits.delete(visit.id)) {
    notify()
  }
}

/**
 * The write side stays private so callers cannot register visits they never finish.
 */
export const propRefreshes = {
  isRefreshing(prop: string): boolean {
    for (const visit of activeVisits.values()) {
      if (visitRefreshesProp(visit, prop)) {
        return true
      }
    }

    return false
  },

  onChange(listener: VoidFunction): VoidFunction {
    listeners.add(listener)

    return () => {
      listeners.delete(listener)
    }
  },
}
