import { cloneDeep } from 'lodash-es'
import { objectsAreEqual } from './objectUtils'
import { page as currentPage } from './page'
import { Response } from './response'
import { timeToMs } from './time'
import {
  ActiveVisit,
  CacheForOption,
  InFlightPrefetch,
  InternalActiveVisit,
  Page,
  PrefetchedResponse,
  PrefetchOptions,
  PrefetchRemovalTimer,
} from './types'

class PrefetchedRequests {
  protected cached: PrefetchedResponse[] = []
  protected inFlightRequests: InFlightPrefetch[] = []
  protected removalTimers: PrefetchRemovalTimer[] = []
  protected currentUseId: string | null = null

  public add(
    params: ActiveVisit,
    sendFunc: (params: InternalActiveVisit) => void,
    { cacheFor, cacheTags }: PrefetchOptions,
  ) {
    const inFlight = this.findInFlight(params)

    if (inFlight) {
      return Promise.resolve()
    }

    const existing = this.findCached(params)

    if (!params.fresh && existing && existing.staleTimestamp > Date.now()) {
      return Promise.resolve()
    }

    const [stale, prefetchExpiresIn] = this.extractStaleValues(cacheFor)

    const promise = new Promise<Response>((resolve, reject) => {
      sendFunc({
        ...params,
        onCancel: () => {
          this.remove(params)
          params.onCancel()
          reject()
        },
        onError: (error) => {
          this.remove(params)
          params.onError(error)
          reject()
        },
        onPrefetching(visitParams) {
          params.onPrefetching(visitParams)
        },
        onPrefetched(response, visit) {
          params.onPrefetched(response, visit)
        },
        onPrefetchResponse(response) {
          resolve(response)
        },
        onPrefetchError(error) {
          prefetchedRequests.removeFromInFlight(params)
          reject(error)
        },
      })
    }).then((response) => {
      this.remove(params)

      const pageResponse = response.getPageResponse()

      currentPage.mergeOncePropsIntoResponse(pageResponse)

      this.cached.push({
        params: { ...params },
        staleTimestamp: Date.now() + stale,
        expiresAt: Date.now() + prefetchExpiresIn,
        response: promise,
        singleUse: prefetchExpiresIn === 0,
        timestamp: Date.now(),
        inFlight: false,
        tags: Array.isArray(cacheTags) ? cacheTags : [cacheTags],
      })

      const oncePropExpiresIn = this.getShortestOncePropTtl(pageResponse)
      this.scheduleForRemoval(
        params,
        oncePropExpiresIn ? Math.min(prefetchExpiresIn, oncePropExpiresIn) : prefetchExpiresIn,
      )
      this.removeFromInFlight(params)

      response.handlePrefetch()

      return response
    })

    this.inFlightRequests.push({
      params: { ...params },
      response: promise,
      staleTimestamp: null,
      inFlight: true,
    })

    return promise
  }

  public removeAll(): void {
    this.cached = []
    this.removalTimers.forEach((removalTimer) => {
      clearTimeout(removalTimer.timer)
    })
    this.removalTimers = []
  }

  public removeByTags(tags: string[]): void {
    this.cached = this.cached.filter((prefetched) => {
      return !prefetched.tags.some((tag) => tags.includes(tag))
    })
  }

  public remove(params: ActiveVisit): void {
    this.cached = this.cached.filter((prefetched) => {
      return !this.paramsAreEqual(prefetched.params, params)
    })

    this.clearTimer(params)
  }

  protected removeFromInFlight(params: ActiveVisit): void {
    this.inFlightRequests = this.inFlightRequests.filter((prefetching) => {
      return !this.paramsAreEqual(prefetching.params, params)
    })
  }

  protected extractStaleValues(cacheFor: PrefetchOptions['cacheFor']): [number, number] {
    const [stale, expires] = this.cacheForToStaleAndExpires(cacheFor)

    return [timeToMs(stale), timeToMs(expires)]
  }

  protected cacheForToStaleAndExpires(cacheFor: PrefetchOptions['cacheFor']): [CacheForOption, CacheForOption] {
    if (!Array.isArray(cacheFor)) {
      return [cacheFor, cacheFor]
    }

    switch (cacheFor.length) {
      case 0:
        return [0, 0]
      case 1:
        return [cacheFor[0], cacheFor[0]]
      default:
        return [cacheFor[0], cacheFor[1]]
    }
  }

  protected clearTimer(params: ActiveVisit) {
    const timer = this.removalTimers.find((removalTimer) => {
      return this.paramsAreEqual(removalTimer.params, params)
    })

    if (timer) {
      clearTimeout(timer.timer)
      this.removalTimers = this.removalTimers.filter((removalTimer) => removalTimer !== timer)
    }
  }

  protected scheduleForRemoval(params: ActiveVisit, expiresIn: number) {
    if (typeof window === 'undefined') {
      return
    }

    this.clearTimer(params)

    if (expiresIn > 0) {
      const timer = window.setTimeout(() => this.remove(params), expiresIn)

      this.removalTimers.push({
        params,
        timer,
      })
    }
  }

  public get(params: ActiveVisit): InFlightPrefetch | PrefetchedResponse | null {
    return this.findCached(params) || this.findInFlight(params)
  }

  public use(prefetched: PrefetchedResponse | InFlightPrefetch, params: ActiveVisit) {
    const id = `${params.url.pathname}-${Date.now()}-${Math.random().toString(36).substring(7)}`

    this.currentUseId = id

    return prefetched.response.then((response) => {
      if (this.currentUseId !== id) {
        // They've since gone on to `use` a different request,
        // so we should ignore this one
        return
      }

      response.mergeParams({ ...params, onPrefetched: () => {} })

      // If this was a one-time cache, remove it
      // (generally a prefetch="click" request with no specified cache value)
      this.removeSingleUseItems(params)

      return response.handle()
    })
  }

  protected removeSingleUseItems(params: ActiveVisit) {
    this.cached = this.cached.filter((prefetched) => {
      if (!this.paramsAreEqual(prefetched.params, params)) {
        return true
      }

      return !prefetched.singleUse
    })
  }

  public findCached(params: ActiveVisit): PrefetchedResponse | null {
    return (
      this.cached.find((prefetched) => {
        return this.paramsAreEqual(prefetched.params, params)
      }) || null
    )
  }

  public findInFlight(params: ActiveVisit): InFlightPrefetch | null {
    return (
      this.inFlightRequests.find((prefetched) => {
        return this.paramsAreEqual(prefetched.params, params)
      }) || null
    )
  }

  protected withoutPurposePrefetchHeader(params: ActiveVisit): ActiveVisit {
    const newParams = cloneDeep(params)
    if (newParams.headers['Purpose'] === 'prefetch') {
      delete newParams.headers['Purpose']
    }
    return newParams
  }

  protected paramsAreEqual(params1: ActiveVisit, params2: ActiveVisit): boolean {
    return objectsAreEqual<ActiveVisit>(
      this.withoutPurposePrefetchHeader(params1),
      this.withoutPurposePrefetchHeader(params2),
      [
        'showProgress',
        'replace',
        'prefetch',
        'preserveScroll',
        'preserveState',
        'onBefore',
        'onBeforeUpdate',
        'onStart',
        'onProgress',
        'onFinish',
        'onCancel',
        'onSuccess',
        'onError',
        'onFlash',
        'onPrefetched',
        'onCancelToken',
        'onPrefetching',
        'async',
        'viewTransition',
        'optimistic',
      ],
    )
  }

  public updateCachedOncePropsFromCurrentPage(): void {
    this.cached.forEach((prefetched) => {
      prefetched.response.then((response) => {
        const pageResponse = response.getPageResponse()

        currentPage.mergeOncePropsIntoResponse(pageResponse, { force: true })

        for (const [group, deferredProps] of Object.entries(pageResponse.deferredProps ?? {})) {
          const remaining = deferredProps.filter((prop) => pageResponse.props[prop] === undefined)

          if (remaining.length > 0) {
            pageResponse.deferredProps![group] = remaining
          } else {
            delete pageResponse.deferredProps![group]
          }
        }

        const oncePropExpiresIn = this.getShortestOncePropTtl(pageResponse)

        if (oncePropExpiresIn === null) {
          return
        }

        const prefetchExpiresIn = prefetched.expiresAt - Date.now()
        const expiresIn = Math.min(prefetchExpiresIn, oncePropExpiresIn)

        if (expiresIn > 0) {
          this.scheduleForRemoval(prefetched.params, expiresIn)
        } else {
          this.remove(prefetched.params)
        }
      })
    })
  }

  protected getShortestOncePropTtl(page: Page): number | null {
    const expiryTimestamps = Object.values(page.onceProps ?? {})
      .map((onceProp) => onceProp.expiresAt)
      .filter((expiresAt): expiresAt is number => !!expiresAt)

    if (expiryTimestamps.length === 0) {
      return null
    }

    return Math.min(...expiryTimestamps) - Date.now()
  }
}

export const prefetchedRequests = new PrefetchedRequests()
