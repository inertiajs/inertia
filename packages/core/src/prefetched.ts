import { objectsAreEqual } from './objectUtils'
import { Response } from './response'
import { ActiveVisit } from './types'

type Prefetched = {
  params: ActiveVisit
  response: Promise<Response>
}

type RemovalTimer = {
  params: ActiveVisit
  timer: NodeJS.Timeout
}

class PrefetchedRequests {
  protected requests: Prefetched[] = []
  protected removalTimers: RemovalTimer[] = []

  public add(
    params: ActiveVisit,
    sendFunc: (params: ActiveVisit) => void,
    {
      staleAfter,
    }: {
      staleAfter: number
    },
  ) {
    if (this.exists(params)) {
      return Promise.resolve()
    }

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
      const timer = setTimeout(() => this.remove(params), staleAfter)

      this.removalTimers.push({
        params,
        timer,
      })

      return response as Response
    })

    this.requests.push({
      params: { ...params },
      response: promise,
    })

    return promise
  }

  public remove(params: ActiveVisit): void {
    this.requests = this.requests.filter((prefetched) => {
      return !this.paramsAreEqual(prefetched.params, params)
    })

    const timer = this.removalTimers.find((removalTimer) => {
      return this.paramsAreEqual(removalTimer.params, params)
    })

    if (timer) {
      clearTimeout(timer.timer)
      this.removalTimers = this.removalTimers.filter((removalTimer) => removalTimer !== timer)
    }
  }

  protected exists(params: ActiveVisit): boolean {
    return this.requests.some((prefetched) => {
      return this.paramsAreEqual(prefetched.params, params)
    })
  }

  public get(params: ActiveVisit): Promise<Prefetched | null> {
    return new Promise((resolve) => {
      const prefetched = this.requests.find((prefetched) => {
        return this.paramsAreEqual(prefetched.params, params)
      })

      resolve(prefetched || null)
    })
  }

  public use(prefetched: Prefetched) {
    prefetched.response
      .then((response) => response.handle())
      .then(() => {
        prefetchedRequests.remove(prefetched.params)
      })
  }

  protected paramsAreEqual(params1: ActiveVisit, params2: ActiveVisit): boolean {
    return objectsAreEqual<ActiveVisit>(params1, params2, ['showProgress', 'replace', 'prefetch'])
  }
}

export const prefetchedRequests = new PrefetchedRequests()
