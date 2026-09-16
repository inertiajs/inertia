import { omit } from 'es-toolkit'
import { router } from '.'
import dialog from './dialog'
import {
  fireErrorEvent,
  fireFlashEvent,
  fireHttpExceptionEvent,
  fireLocationEvent,
  firePrefetchedEvent,
  fireSuccessEvent,
} from './events'
import { history } from './history'
import { interceptors } from './interceptors'
import { isLayerResponse, layerAt, layerPageOf, layersOf, tierOf, withoutClosingLayers } from './layers'
import { landResponse } from './layers/landing'
import { landWalk } from './layers/walk'
import { page as currentPage } from './page'
import { responseQueue } from './queue'
import { RequestParams } from './requestParams'
import { SessionStorage } from './sessionStorage'
import { ActiveVisit, BaseSnapshot, ErrorBag, Errors, HttpResponse, LayerState, Page } from './types'
import { hrefToUrl, isSameUrlWithoutHash, setHashIfSameUrl } from './url'

export class Response {
  protected wasPrefetched = false
  protected processed = false

  constructor(
    protected requestParams: RequestParams,
    protected response: HttpResponse,
    protected originatingPage: Page,
    protected capturedBase: BaseSnapshot,
  ) {}

  public static create(
    params: RequestParams,
    response: HttpResponse,
    originatingPage: Page,
    capturedBase: BaseSnapshot,
  ): Response {
    return new Response(params, response, originatingPage, capturedBase)
  }

  public isProcessed(): boolean {
    return this.processed
  }

  public async handlePrefetch() {
    if (isSameUrlWithoutHash(this.requestParams.all().url, window.location)) {
      this.handle()
    }
  }

  public async handle() {
    return responseQueue.add(() => this.process())
  }

  public async process() {
    if (this.requestParams.all().prefetch) {
      this.wasPrefetched = true
      this.requestParams.all().prefetch = false

      this.requestParams.all().onPrefetched(this.response, this.requestParams.all())
      firePrefetchedEvent(this.response, this.requestParams.all())

      return Promise.resolve()
    }

    this.requestParams.runCallbacks()
    this.processed = true

    if (!this.isInertiaResponse()) {
      return this.handleNonInertiaResponse()
    }

    if (this.isHttpException()) {
      const response = {
        ...this.response,
        data: this.getDataFromResponse(this.response.data),
      }

      if (this.requestParams.all().onHttpException(response) === false) {
        return
      }

      if (!fireHttpExceptionEvent(response)) {
        return
      }
    }

    const data = this.getDataFromResponse(this.response.data)

    if (data && data.close) {
      const { layerId } = this.requestParams.all()
      const closes = layerId === undefined ? layersOf(currentPage.get()).at(-1) : layerAt(currentPage.get(), layerId)

      if (closes) {
        // Not awaited: the close's refresh queues behind this response.
        router.close(closes.id)
      } else {
        router.reload()
      }

      router.flushByCacheTags(this.requestParams.all().invalidateCacheTags || [])

      const landsOn = withoutClosingLayers(currentPage.get())

      fireSuccessEvent(landsOn, { visitId: this.requestParams.all().id })

      return this.requestParams.all().onSuccess(landsOn)
    }

    await history.processQueue()

    history.preserveUrl = this.requestParams.all().preserveUrl

    const landedOn = await this.setPage()

    const page = currentPage.get()
    const tier = landedOn === undefined ? page : layerAt(page, landedOn)
    // A form inside a layer reads back its own tier, as its flash and errors already do.
    const landedPage = landedOn === undefined || !tier ? page : layerPageOf(page, tier as LayerState)

    if (tier) {
      const { flash } = tier

      if (Object.keys(flash).length > 0 && !this.requestParams.isDeferredPropsRequest()) {
        fireFlashEvent(flash)
        this.requestParams.all().onFlash(flash)
      }

      const errors = (tier.props.errors || {}) as Errors & ErrorBag

      if (Object.keys(errors).length > 0) {
        const scopedErrors = this.getScopedErrors(errors)

        fireErrorEvent(scopedErrors, { page: landedPage, stack: page, visitId: this.requestParams.all().id })

        return this.requestParams.all().onError(scopedErrors)
      }
    }

    router.flushByCacheTags(this.requestParams.all().invalidateCacheTags || [])

    if (!this.wasPrefetched) {
      // We end up here other than from the prefetch cache, so we assume this response is
      // newer than the cached one and therefore flush the cache.
      router.flush(tier?.url ?? page.url)
    }

    fireSuccessEvent(landedPage, { stack: page, visitId: this.requestParams.all().id })

    await this.requestParams.all().onSuccess(landedPage)

    history.preserveUrl = false
  }

  public mergeParams(params: ActiveVisit) {
    this.requestParams.merge(params)
  }

  public setCapturedBase(capturedBase: BaseSnapshot): void {
    this.capturedBase = capturedBase
  }

  public getPageResponse(): Page {
    const data = this.getDataFromResponse(this.response.data)

    // Only spread if data is an object (not a string like HTML error pages)
    if (typeof data === 'object') {
      return (this.response.data = { ...data, flash: data.flash ?? {}, rescuedProps: data.rescuedProps ?? [] })
    }

    return (this.response.data = data)
  }

  protected async handleNonInertiaResponse() {
    if (this.isInertiaRedirect()) {
      const params = omit(this.requestParams.all(), ['layerId', 'layerOwner'])

      router.visit(this.getHeader('x-inertia-redirect'), {
        ...params,
        method: 'get',
        data: {},
      })

      return
    }

    if (this.isLocationVisit()) {
      const locationUrl = hrefToUrl(this.getHeader('x-inertia-location'))

      setHashIfSameUrl(this.requestParams.all().url, locationUrl)

      return this.locationVisit(locationUrl)
    }

    const response = {
      ...this.response,
      data: this.getDataFromResponse(this.response.data),
    }

    if (this.requestParams.all().onHttpException(response) === false) {
      return
    }

    if (fireHttpExceptionEvent(response)) {
      return dialog.show(response.data)
    }
  }

  protected isInertiaResponse(): boolean {
    return this.hasHeader('x-inertia')
  }

  protected isHttpException(): boolean {
    return this.response.status >= 400
  }

  protected hasStatus(status: number): boolean {
    return this.response.status === status
  }

  protected getHeader(header: string): string {
    return this.response.headers[header]
  }

  protected hasHeader(header: string): boolean {
    return this.getHeader(header) !== undefined
  }

  protected isInertiaRedirect(): boolean {
    return this.hasStatus(409) && this.hasHeader('x-inertia-redirect')
  }

  protected isLocationVisit(): boolean {
    return this.hasStatus(409) && this.hasHeader('x-inertia-location')
  }

  /**
   * @link https://inertiajs.com/redirects#external-redirects
   */
  protected locationVisit(url: URL): Promise<void> | boolean | void {
    try {
      if (typeof window === 'undefined') {
        return
      }

      const responseVersion = this.getHeader('x-inertia-version')
      const versionChange = !!responseVersion && responseVersion !== currentPage.get().version

      if (!fireLocationEvent(url, versionChange)) {
        return
      }

      // A version change on a background request only needs to pick up new assets, so we don't
      // force a full-page navigation the user never initiated. The next user-initiated visit
      // hits the same location response and reloads then.
      if (versionChange && this.requestParams.all().async) {
        if (this.requestParams.isWalkRequest()) {
          return landWalk(this.capturedBase.generation)
        }

        return
      }

      SessionStorage.set(SessionStorage.locationVisitKey, {
        preserveScroll: this.requestParams.all().preserveScroll === true,
      })

      if (isSameUrlWithoutHash(window.location, url)) {
        window.location.reload()
      } else {
        window.location.href = url.href
      }
    } catch (error) {
      return false
    }
  }

  protected async setPage(): Promise<string | undefined> {
    const pageResponse = this.getPageResponse()

    if (!this.shouldSetPage(pageResponse)) {
      return undefined
    }

    this.response = await interceptors.processResponse(this.requestParams.all(), this.response)

    return landResponse(pageResponse, this.requestParams, this.capturedBase)
  }

  // Landing it would reopen what the user dismissed; an open carries no tier yet, so it is exempt.
  protected answersAClosedLayer(pageResponse: Page): boolean {
    const { layerId, layerOwner } = this.requestParams.all()

    return (
      layerId !== undefined &&
      layerOwner === undefined &&
      !layerAt(currentPage.get(), layerId) &&
      isLayerResponse(pageResponse)
    )
  }

  protected getDataFromResponse(response: any): any {
    if (typeof response !== 'string') {
      return response
    }

    try {
      return JSON.parse(response)
    } catch (error) {
      return response
    }
  }

  protected shouldSetPage(pageResponse: Page): boolean {
    if (this.requestParams.isWalkRequest()) {
      return this.capturedBase.generation === currentPage.generation()
    }

    if (this.answersAClosedLayer(pageResponse)) {
      return false
    }

    if (!this.requestParams.all().async) {
      // If the request is sync, we should always set the page
      return true
    }

    const originating = tierOf(this.originatingPage, this.requestParams.all().layerId)
    const live = tierOf(currentPage.get(), this.requestParams.all().layerId)

    if (originating.component !== pageResponse.component) {
      // We originated from a component but the response re-directed us,
      // we should respect the redirection and set the page
      return true
    }

    // At this point, if the originating request component is different than the current component,
    // the user has since navigated and we should discard the response
    if (originating.component !== live.component) {
      return false
    }

    if (originating.url === null || live.url === null) {
      return originating.url === live.url
    }

    const originatingUrl = hrefToUrl(originating.url)
    const liveUrl = hrefToUrl(live.url)

    // We have the same component, let's double-check the URL
    // If we're no longer on the same path name (e.g. /users/1 -> /users/2), we should not set the page
    return originatingUrl.origin === liveUrl.origin && originatingUrl.pathname === liveUrl.pathname
  }

  protected getScopedErrors(errors: Errors & ErrorBag): Errors {
    if (!this.requestParams.all().errorBag) {
      return errors
    }

    return errors[this.requestParams.all().errorBag || ''] || {}
  }
}
