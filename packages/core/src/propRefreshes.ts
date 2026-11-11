import { get } from 'es-toolkit/compat'
import { layerAt, reloadUrlOf } from './layers'
import { page as currentPage } from './page'
import { RefreshFilter, visitRefreshesProp } from './partialReload'
import { ActiveVisit, Page, PageProps } from './types'
import { hrefToUrl, isSameUrlWithoutQueryOrHash } from './url'

/**
 * A layer is a page of its own, so every claim belongs to one tier: the layer
 * it names, or the page beneath the stack when it names none.
 */
const activeVisits = new Map<string, { layerId: string | undefined; filter: RefreshFilter }>()
const pendingDeferredProps = new Map<string | undefined, RefreshFilter>()
const listeners = new Set<VoidFunction>()

const notify = (): void => {
  listeners.forEach((listener) => listener())
}

/**
 * Prefetches, visits that open a layer and requests aimed at another page are
 * ignored, since none of them refreshes the props you're looking at.
 */
export const trackPropRefresh = (visit: ActiveVisit): void => {
  if (typeof window === 'undefined' || visit.prefetch) {
    return
  }

  const page = currentPage.get() as Page | undefined
  const layer = page ? layerAt(page, visit.layerId) : undefined

  if (visit.layerId !== undefined && !layer) {
    return
  }

  const tierUrl = page ? reloadUrlOf(page, layer?.id, window.location.href) : window.location.href

  if (!isSameUrlWithoutQueryOrHash(visit.url, hrefToUrl(tierUrl))) {
    return
  }

  activeVisits.set(visit.id, {
    layerId: layer?.id,
    filter: { only: visit.only, except: visit.except, reset: visit.reset },
  })

  notify()
}

/**
 * Deferred props are only requested once their page has rendered, so the ones
 * a tier is about to load count as refreshing until those requests start.
 */
export const setPendingDeferredProps = (
  props: PageProps,
  deferredProps: Page['deferredProps'],
  layerId?: string,
): void => {
  if (typeof window === 'undefined') {
    return
  }

  const missing = Object.values(deferredProps ?? {})
    .flat()
    .filter((prop) => get(props, prop) === undefined)

  if (missing.length === 0) {
    clearPendingDeferredProps(layerId)

    return
  }

  pendingDeferredProps.set(layerId, { only: missing, except: [], reset: [] })

  notify()
}

export const clearPendingDeferredProps = (layerId?: string): void => {
  if (pendingDeferredProps.delete(layerId)) {
    notify()
  }
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
  isRefreshing(prop: string, layerId?: string): boolean {
    for (const visit of activeVisits.values()) {
      if (visit.layerId === layerId && visitRefreshesProp(visit.filter, prop)) {
        return true
      }
    }

    const pending = pendingDeferredProps.get(layerId)

    return pending !== undefined && visitRefreshesProp(pending, prop)
  },

  onChange(listener: VoidFunction): VoidFunction {
    listeners.add(listener)

    return () => {
      listeners.delete(listener)
    }
  },
}
