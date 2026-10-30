import { get } from 'es-toolkit/compat'
import { RefreshFilter, visitRefreshesProp } from './partialReload'
import { ActiveVisit, Page } from './types'
import { isSameUrlWithoutQueryOrHash } from './url'

const activeVisits = new Map<string, RefreshFilter>()
const listeners = new Set<VoidFunction>()

let pendingDeferredProps: RefreshFilter | null = null

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

/**
 * Deferred props are only requested once their page has rendered, so the ones
 * a page is about to load count as refreshing until those requests start.
 */
export const setPendingDeferredProps = (props: Page['props'], deferredProps: Page['deferredProps']): void => {
  if (typeof window === 'undefined') {
    return
  }

  const missing = Object.values(deferredProps ?? {})
    .flat()
    .filter((prop) => get(props, prop) === undefined)

  if (missing.length === 0) {
    clearPendingDeferredProps()

    return
  }

  pendingDeferredProps = { only: missing, except: [], reset: [] }

  notify()
}

export const clearPendingDeferredProps = (): void => {
  if (pendingDeferredProps === null) {
    return
  }

  pendingDeferredProps = null

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

    return pendingDeferredProps !== null && visitRefreshesProp(pendingDeferredProps, prop)
  },

  onChange(listener: VoidFunction): VoidFunction {
    listeners.add(listener)

    return () => {
      listeners.delete(listener)
    }
  },
}
