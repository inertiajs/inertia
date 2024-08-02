import { objectsAreEqual } from './objectUtils'
import { Response } from './response'
import { timeToMs } from './time'
import {
  ActivelyPrefetching,
  ActiveVisit,
  cacheForOption,
  PrefetchedResponse,
  PrefetchOptions,
  PrefetchRemovalTimer,
} from './types'

class PrefetchedRequests {
  protected cached: PrefetchedResponse[] = []
  protected activeRequests: ActivelyPrefetching[] = []
  protected removalTimers: PrefetchRemovalTimer[] = []

  public add(params: ActiveVisit, sendFunc: (params: ActiveVisit) => void, { cacheFor }: PrefetchOptions) {
    const inFlight = this.findInFlight(params)

    if (inFlight) {
      return Promise.resolve()
    }

    const existing = this.findCached(params)

    if (!params.fresh && existing && existing.staleTimestamp > Date.now()) {
      return Promise.resolve()
    }

    const [stale, expires] = this.extractStaleValues(cacheFor)

    const promise = new Promise((resolve, reject) => {
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
        onPrefetched(response) {
          params.onPrefetched(response)
          resolve(response)
        },
      })
    }).then((response) => {
      this.remove(params)

      this.cached.push({
        params: { ...params },
        staleTimestamp: Date.now() + timeToMs(stale),
        response: promise,
      })

      this.scheduleForRemoval(params, expires)

      this.activeRequests = this.activeRequests.filter((prefetching) => {
        return !this.paramsAreEqual(prefetching.params, params)
      })

      return response as Response
    })

    this.activeRequests.push({
      params: { ...params },
      response: promise,
      staleTimestamp: null,
    })

    return promise
  }

  public remove(params: ActiveVisit): void {
    this.cached = this.cached.filter((prefetched) => {
      return !this.paramsAreEqual(prefetched.params, params)
    })

    this.clearTimer(params)
  }

  protected extractStaleValues(cacheFor: PrefetchOptions['cacheFor']): [cacheForOption, cacheForOption] {
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

  protected scheduleForRemoval(params: ActiveVisit, expiresIn: cacheForOption) {
    this.clearTimer(params)

    expiresIn = timeToMs(expiresIn)

    if (expiresIn > 0) {
      const timer = window.setTimeout(() => this.remove(params), expiresIn)

      this.removalTimers.push({
        params,
        timer,
      })
    }
  }

  public get(params: ActiveVisit): ActivelyPrefetching | PrefetchedResponse | null {
    return this.findCached(params) || this.findInFlight(params)
  }

  public use(prefetched: PrefetchedResponse | ActivelyPrefetching, params: ActiveVisit) {
    prefetched.response.then((response) => {
      response.mergeParams({ ...params, onPrefetched: () => {} })

      // If this was a one-time cache (generally a prefetch="click"
      // request with no specified stale timeout), remove it
      this.removeStaleItemFromCache(params)

      return response.handle()
    })
  }

  protected removeStaleItemFromCache(params: ActiveVisit) {
    this.cached = this.cached.filter((prefetched) => {
      if (!this.paramsAreEqual(prefetched.params, params)) {
        return true
      }

      return prefetched.staleTimestamp > Date.now()
    })
  }

  protected findCached(params: ActiveVisit): PrefetchedResponse | null {
    return (
      this.cached.find((prefetched) => {
        return this.paramsAreEqual(prefetched.params, params)
      }) || null
    )
  }

  protected findInFlight(params: ActiveVisit): ActivelyPrefetching | null {
    return (
      this.activeRequests.find((prefetched) => {
        return this.paramsAreEqual(prefetched.params, params)
      }) || null
    )
  }

  protected paramsAreEqual(params1: ActiveVisit, params2: ActiveVisit): boolean {
    return objectsAreEqual<ActiveVisit>(params1, params2, [
      'showProgress',
      'replace',
      'prefetch',
      'onBefore',
      'onStart',
      'onProgress',
      'onFinish',
      'onCancel',
      'onSuccess',
      'onError',
      'onPrefetched',
      'onCancelToken',
    ])
  }
}

export const prefetchedRequests = new PrefetchedRequests()
