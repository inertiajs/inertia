import { default as axios, AxiosProgressEvent, AxiosRequestConfig, AxiosResponse } from 'axios'
import { fireExceptionEvent, fireFinishEvent, fireProgressEvent, fireStartEvent } from './events'
import { page as currentPage } from './page'
import { RequestParams } from './requestParams'
import { Response } from './response'
import { ActiveVisit, Page } from './types'
import { urlWithoutHash } from './url'

export class Request {
  protected response!: AxiosResponse
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

  public async send() {
    this.requestParams.onCancelToken(() => this.cancel({ cancelled: true }))

    fireStartEvent(this.requestParams.all())
    this.requestParams.onStart()

    return axios({
      method: this.requestParams.all().method,
      url: urlWithoutHash(this.requestParams.all().url).href,
      data: this.requestParams.data(),
      params: this.requestParams.queryParams(),
      signal: this.cancelToken.signal,
      headers: this.getHeaders(),
      onUploadProgress: this.onProgress.bind(this),
    })
      .then((response) => {
        return Response.create(this.requestParams, response, this.page).handle()
      })
      .catch((error) => {
        if (error?.response) {
          return Response.create(this.requestParams, error.response, this.page).handle()
        }

        return Promise.reject(error)
      })
      .catch((error) => {
        if (axios.isCancel(error)) {
          return
        }

        if (fireExceptionEvent(error)) {
          return Promise.reject(error)
        }
      })
      .finally(() => {
        this.finish()
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

  protected onProgress(progress: AxiosProgressEvent): void {
    if (this.requestParams.data() instanceof FormData) {
      progress.percentage = progress.progress ? Math.round(progress.progress * 100) : 0
      fireProgressEvent(progress)
      this.requestParams.all().onProgress(progress)
    }
  }

  protected getHeaders(): AxiosRequestConfig['headers'] {
    const headers: AxiosRequestConfig['headers'] = {
      ...this.requestParams.headers(),
      Accept: 'text/html, application/xhtml+xml',
      'X-Requested-With': 'XMLHttpRequest',
      'X-Inertia': true,
    }

    if (currentPage.get().meta.assetVersion) {
      headers['X-Inertia-Version'] = currentPage.get().meta.assetVersion
    }

    return headers
  }
}
