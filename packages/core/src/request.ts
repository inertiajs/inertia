import { fireFinishEvent, fireNetworkErrorEvent, firePrefetchingEvent, fireProgressEvent, fireStartEvent } from './events'
import { http } from './http'
import { HttpCancelledError, HttpResponseError } from './httpErrors'
import { page as currentPage } from './page'
import { RequestParams } from './requestParams'
import { Response } from './response'
import type { ActiveVisit, Page } from './types'
import { HttpProgressEvent, HttpRequestHeaders } from './types'
import { urlWithoutHash } from './url'

export class Request {
  protected response!: Response
  protected cancelToken!: AbortController
  protected requestParams: RequestParams
  protected requestHasFinished = false

  constructor(
    params: ActiveVisit,
    protected page: Page,
  ) {
    this.requestParams = RequestParams.create(params)
    this.cancelToken = new AbortController()
  }

  public static create(params: ActiveVisit, page: Page): Request {
    return new Request(params, page)
  }

  public isPrefetch(): boolean {
    return this.requestParams.isPrefetch()
  }

  public async send() {
    this.requestParams.onCancelToken(() => this.cancel({ cancelled: true }))

    fireStartEvent(this.requestParams.all())
    this.requestParams.onStart()

    if (this.requestParams.all().prefetch) {
      this.requestParams.onPrefetching()
      firePrefetchingEvent(this.requestParams.all())
    }

    // We capture this up here because the response
    // will clear the prefetch flag so it can use it
    // as a regular response once the prefetch is done
    const originallyPrefetch = this.requestParams.all().prefetch

    return http
      .getClient()
      .request({
        method: this.requestParams.all().method,
        url: urlWithoutHash(this.requestParams.all().url).href,
        data: this.requestParams.data(),
        signal: this.cancelToken.signal,
        headers: this.getHeaders(),
        onUploadProgress: this.onProgress.bind(this),
      })
      .then((response) => {
        this.response = Response.create(this.requestParams, response, this.page)

        return this.response.handle()
      })
      .catch((error) => {
        // Handle HTTP error responses (4xx/5xx)
        if (error instanceof HttpResponseError) {
          this.response = Response.create(this.requestParams, error.response, this.page)

          return this.response.handle()
        }

        return Promise.reject(error)
      })
      .catch((error) => {
        // Handle cancelled requests
        if (error instanceof HttpCancelledError) {
          return
        }

        if (this.requestParams.all().onNetworkError(error) === false) {
          return
        }

        if (fireNetworkErrorEvent(error)) {
          if (originallyPrefetch) {
            this.requestParams.onPrefetchError(error)
          }

          return Promise.reject(error)
        }
      })
      .finally(() => {
        this.finish()

        if (originallyPrefetch && this.response) {
          this.requestParams.onPrefetchResponse(this.response)
        }
      })
  }

  protected finish(): void {
    if (this.requestParams.wasCancelledAtAll()) {
      return
    }

    this.requestParams.markAsFinished()
    this.fireFinishEvents()
  }

  protected fireFinishEvents(): void {
    if (this.requestHasFinished) {
      // This could be called from multiple places, don't let it re-fire
      return
    }

    this.requestHasFinished = true

    fireFinishEvent(this.requestParams.all())
    this.requestParams.onFinish()
  }

  public cancel({ cancelled = false, interrupted = false }: { cancelled?: boolean; interrupted?: boolean }): void {
    if (this.requestHasFinished) {
      // If the request has already finished, there's no need to cancel it
      return
    }

    this.cancelToken.abort()

    this.requestParams.markAsCancelled({ cancelled, interrupted })

    this.fireFinishEvents()
  }

  protected onProgress(progress: HttpProgressEvent): void {
    if (this.requestParams.data() instanceof FormData) {
      progress.percentage = progress.progress ? Math.round(progress.progress * 100) : 0
      fireProgressEvent(progress)
      this.requestParams.all().onProgress(progress)
    }
  }

  protected getHeaders(): HttpRequestHeaders {
    const headers: HttpRequestHeaders = {
      ...this.requestParams.headers(),
      Accept: 'text/html, application/xhtml+xml',
      'X-Requested-With': 'XMLHttpRequest',
      'X-Inertia': true,
    }

    const page = currentPage.get()

    if (page.version) {
      headers['X-Inertia-Version'] = page.version
    }

    const onceProps = Object.entries(page.onceProps || {})
      .filter(([, onceProp]) => {
        if (page.props[onceProp.prop] === undefined) {
          // The prop could deferred and not be loaded yet
          return false
        }

        return !onceProp.expiresAt || onceProp.expiresAt > Date.now()
      })
      .map(([key]) => key)

    if (onceProps.length > 0) {
      headers['X-Inertia-Except-Once-Props'] = onceProps.join(',')
    }

    return headers
  }
}
