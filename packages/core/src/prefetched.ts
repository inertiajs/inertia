import { objectsAreEqual } from './objectUtils'
import { Response } from './response'
import { timeToMs } from './time'
import {
  ActivelyPrefetching,
  ActiveVisit,
  PrefetchedResponse,
  PrefetchOptions,
  PrefetchRemovalTimer,
  StaleAfterOption,
} from './types'

class PrefetchedRequests {
  protected cached: PrefetchedResponse[] = []
  protected activeRequests: ActivelyPrefetching[] = []
  protected removalTimers: PrefetchRemovalTimer[] = []

  public add(params: ActiveVisit, sendFunc: (params: ActiveVisit) => void, { staleAfter }: PrefetchOptions) {
    const inFlight = this.findInFlight(params)

    if (inFlight) {
      return Promise.resolve()
    }

    const existing = this.findCached(params)

    if (existing && existing.staleTimestamp > Date.now()) {
      return Promise.resolve()
    }

    const [stale, expires] = this.extractStaleValues(staleAfter)

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

  protected extractStaleValues(staleAfter: PrefetchOptions['staleAfter']): [StaleAfterOption, StaleAfterOption] {
    if (!Array.isArray(staleAfter)) {
      return [staleAfter, staleAfter]
    }

    switch (staleAfter.length) {
      case 0:
        return [0, 0]
      case 1:
        return [staleAfter[0], staleAfter[0]]
      default:
        return [staleAfter[0], staleAfter[1]]
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

  protected scheduleForRemoval(params: ActiveVisit, expiresIn: StaleAfterOption) {
    this.clearTimer(params)

    const timer = window.setTimeout(() => this.remove(params), timeToMs(expiresIn))

    this.removalTimers.push({
      params,
      timer,
    })
  }

  public get(params: ActiveVisit): ActivelyPrefetching | PrefetchedResponse | null {
    return this.findCached(params) || this.findInFlight(params)
  }

  public use(prefetched: PrefetchedResponse | ActivelyPrefetching, params: ActiveVisit) {
    prefetched.response.then((response) => {
      response.mergeParams({ ...params, onPrefetched: () => {} })

      return response.handle()
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
    ])
  }
}

export const prefetchedRequests = new PrefetchedRequests()
