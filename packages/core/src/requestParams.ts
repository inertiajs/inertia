import { AxiosRequestConfig } from 'axios'
import { page as currentPage } from './page'
import { Response } from './response'
import { ActiveVisit, InternalActiveVisit, Page, PreserveStateOption, VisitCallbacks } from './types'

export class RequestParams {
  protected callbacks: {
    name: keyof VisitCallbacks
    args: any[]
  }[] = []

  protected params: InternalActiveVisit

  constructor(params: InternalActiveVisit) {
    if (!params.prefetch) {
      this.params = params
    } else {
      const wrappedCallbacks: Record<keyof VisitCallbacks, () => any> = {
        onBefore: this.wrapCallback(params, 'onBefore'),
        onStart: this.wrapCallback(params, 'onStart'),
        onProgress: this.wrapCallback(params, 'onProgress'),
        onFinish: this.wrapCallback(params, 'onFinish'),
        onCancel: this.wrapCallback(params, 'onCancel'),
        onSuccess: this.wrapCallback(params, 'onSuccess'),
        onError: this.wrapCallback(params, 'onError'),
        onCancelToken: this.wrapCallback(params, 'onCancelToken'),
        onPrefetched: this.wrapCallback(params, 'onPrefetched'),
        onPrefetching: this.wrapCallback(params, 'onPrefetching'),
      }

      this.params = {
        ...params,
        ...wrappedCallbacks,
        onPrefetchResponse: params.onPrefetchResponse || (() => {}),
      }
    }
    //
  }

  public static create(params: ActiveVisit): RequestParams {
    return new RequestParams(params)
  }

  public data() {
    return this.params.method === 'get' ? null : this.params.data
  }

  public queryParams() {
    return this.params.method === 'get' ? this.params.data : {}
  }

  public isPartial() {
    return this.params.only.length > 0 || this.params.except.length > 0 || this.params.reset.length > 0
  }

  public onCancelToken(cb: VoidFunction) {
    this.params.onCancelToken({
      cancel: cb,
    })
  }

  public markAsFinished() {
    this.params.completed = true
    this.params.cancelled = false
    this.params.interrupted = false
  }

  public markAsCancelled({ cancelled = true, interrupted = false }) {
    this.params.onCancel()

    this.params.completed = false
    this.params.cancelled = cancelled
    this.params.interrupted = interrupted
  }

  public wasCancelledAtAll() {
    return this.params.cancelled || this.params.interrupted
  }

  public onFinish() {
    this.params.onFinish(this.params)
  }

  public onStart() {
    this.params.onStart(this.params)
  }

  public onPrefetching() {
    this.params.onPrefetching(this.params)
  }

  public onPrefetchResponse(response: Response) {
    if (this.params.onPrefetchResponse) {
      this.params.onPrefetchResponse(response)
    }
  }

  public all() {
    return this.params
  }

  public headers(): AxiosRequestConfig['headers'] {
    const headers: AxiosRequestConfig['headers'] = {
      ...this.params.headers,
    }

    if (this.isPartial()) {
      headers['X-Inertia-Partial-Component'] = currentPage.get().component
    }

    const only = this.params.only.concat(this.params.reset)

    if (only.length > 0) {
      headers['X-Inertia-Partial-Data'] = only.join(',')
    }

    if (this.params.except.length > 0) {
      headers['X-Inertia-Partial-Except'] = this.params.except.join(',')
    }

    if (this.params.reset.length > 0) {
      headers['X-Inertia-Reset'] = this.params.reset.join(',')
    }

    if (this.params.errorBag && this.params.errorBag.length > 0) {
      headers['X-Inertia-Error-Bag'] = this.params.errorBag
    }

    return headers
  }

  public setPreserveOptions(page: Page) {
    this.params.preserveScroll = this.resolvePreserveOption(this.params.preserveScroll, page)
    this.params.preserveState = this.resolvePreserveOption(this.params.preserveState, page)
  }

  public runCallbacks() {
    this.callbacks.forEach(({ name, args }) => {
      // @ts-ignore
      this.params[name](...args)
    })
  }

  public merge(toMerge: Partial<ActiveVisit>) {
    this.params = {
      ...this.params,
      ...toMerge,
    }
  }

  protected wrapCallback(params: ActiveVisit, name: keyof VisitCallbacks) {
    // @ts-ignore
    return (...args) => {
      this.recordCallback(name, args)
      // @ts-ignore
      params[name](...args)
    }
  }

  protected recordCallback(name: keyof VisitCallbacks, args: any[]) {
    this.callbacks.push({ name, args })
  }

  protected resolvePreserveOption(value: PreserveStateOption, page: Page): boolean {
    if (typeof value === 'function') {
      return value(page)
    }

    if (value === 'errors') {
      return Object.keys(page.props.errors || {}).length > 0
    }

    return value
  }
}
