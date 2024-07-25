import { AxiosRequestConfig } from 'axios'
import { page as currentPage } from './page'
import { ActiveVisit, Page, PreserveStateOption } from './types'

export class RequestParams {
  constructor(public params: ActiveVisit) {
    //
  }

  public static create(params: ActiveVisit): RequestParams {
    return new RequestParams(params)
  }

  public data() {
    return this.params.method === 'get' ? {} : this.params.data
  }

  public queryParams() {
    return this.params.method === 'get' ? this.params.data : {}
  }

  public isPartial() {
    return this.params.only.length > 0 || this.params.except.length > 0
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

    const only = this.params.only.concat(this.params.fresh)

    if (only.length > 0) {
      headers['X-Inertia-Partial-Data'] = only.join(',')
    }

    if (this.params.except.length > 0) {
      headers['X-Inertia-Partial-Except'] = this.params.except.join(',')
    }

    if (this.params.fresh.length > 0) {
      headers['X-Inertia-Fresh'] = this.params.fresh.join(',')
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
