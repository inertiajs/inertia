import { RefreshFilter, visitRefreshesProp } from './partialReload'
import { ActiveVisit } from './types'
import { isSameUrlWithoutQueryOrHash } from './url'

const activeVisits = new Map<string, RefreshFilter>()
const listeners = new Set<VoidFunction>()

const notify = (): void => {
  listeners.forEach((listener) => listener())
}

/**
 * Prefetches and requests aimed at another page are ignored, since neither
 * refreshes the props you're looking at.
 */
export const trackPropRefresh = (visit: ActiveVisit): void => {
  if (typeof window === 'undefined' || visit.prefetch) {
    return
  }

  if (!isSameUrlWithoutQueryOrHash(visit.url, window.location)) {
    return
  }

  activeVisits.set(visit.id, { only: visit.only, except: visit.except, reset: visit.reset })

  notify()
}

export const untrackPropRefresh = (visit: ActiveVisit): void => {
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
