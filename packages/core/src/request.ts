import { get } from 'es-toolkit/compat'
import {
  fireFinishEvent,
  fireNetworkErrorEvent,
  firePrefetchingEvent,
  fireProgressEvent,
  fireStartEvent,
} from './events'
import { http } from './http'
import { HttpCancelledError, HttpResponseError } from './httpErrors'
import { interceptors } from './interceptors'
import { closeUnlandedLayer, layerAt } from './layers'
import { page as currentPage } from './page'
import { RequestParams } from './requestParams'
import { Response } from './response'
import type { ActiveVisit, BaseSnapshot, Page } from './types'
import { HttpProgressEvent, HttpRequestConfig, HttpRequestHeaders } from './types'
import { urlWithoutHash } from './url'

export class Request {
  protected response!: Response
  protected cancelToken!: AbortController
  protected requestParams: RequestParams
  protected requestHasFinished = false
  protected optimistic: boolean

  constructor(
    params: ActiveVisit,
    protected page: Page,
    protected capturedBase: BaseSnapshot,
    { optimistic = false }: { optimistic?: boolean } = {},
  ) {
    this.requestParams = RequestParams.create(params)
    this.cancelToken = new AbortController()
    this.optimistic = optimistic
  }

  public static create(
    params: ActiveVisit,
    page: Page,
    capturedBase: BaseSnapshot,
    options?: { optimistic?: boolean },
  ): Request {
    return new Request(params, page, capturedBase, options)
  }

  public isPrefetch(): boolean {
    return this.requestParams.isPrefetch()
  }

  public getUrl(): URL {
    return this.requestParams.all().url
  }

  public get layerId(): string | undefined {
    return this.requestParams.all().layerId
  }

  public isOptimistic(): boolean {
    return this.optimistic
  }

  public isPendingOptimistic(): boolean {
    return this.isOptimistic() && (!this.response || !this.response.isProcessed())
  }

  public async send() {
    this.requestParams.onCancelToken(() => {
      // Once the response has arrived it's too late to cancel, the page is already being updated
      if (this.response) {
        return
      }

      this.cancel({ cancelled: true })
    })

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

    const config: HttpRequestConfig = {
      method: this.requestParams.all().method,
      url: urlWithoutHash(this.requestParams.all().url).href,
      data: this.requestParams.data(),
      signal: this.cancelToken.signal,
      headers: this.getHeaders(),
      onUploadProgress: this.onProgress.bind(this),
    }

    const processedConfig = await interceptors.processRequest(this.requestParams.all(), config)

    return http
      .getClient()
      .request(processedConfig)
      .then((response) => {
        this.response = Response.create(this.requestParams, response, this.page, this.capturedBase)

        return this.response.handle()
      })
      .catch((error) => {
        // Handle HTTP error responses (4xx/5xx)
        if (error instanceof HttpResponseError) {
          this.response = Response.create(this.requestParams, error.response, this.page, this.capturedBase)

          return this.response.handle()
        }

        return Promise.reject(error)
      })
      .catch((error) => {
        // Handle cancelled requests
        if (error instanceof HttpCancelledError) {
          return
        }

        // A request that never brought a response back leaves nothing to open the layer it was
        // aimed at, so the attempt is spent here as it is on every other terminal path.
        closeUnlandedLayer(currentPage.get(), this.requestParams.all().layerId)

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

    closeUnlandedLayer(currentPage.get(), this.requestParams.all().layerId)

    this.fireFinishEvents()
  }

  protected onProgress(progress: HttpProgressEvent): void {
    if (this.requestParams.data() instanceof FormData) {
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

    // A request names its own tier's once keys in the except header, never a union with another's.
    // A visit opening a layer has no tier of its own yet, so it names none.
    const { layerId } = this.requestParams.all()
    const tier = layerId === undefined ? page : layerAt(page, layerId)
    const onceProps = tier
      ? Object.entries(tier.onceProps || {})
          .filter(([, onceProp]) => {
            if (get(tier.props, onceProp.prop) === undefined) {
              // The prop could deferred and not be loaded yet
              return false
            }

            return !onceProp.expiresAt || onceProp.expiresAt > Date.now()
          })
          .map(([key]) => key)
      : []

    if (onceProps.length > 0) {
      headers['X-Inertia-Except-Once-Props'] = onceProps.join(',')
    }

    return headers
  }
}
