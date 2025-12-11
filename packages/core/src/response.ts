import { AxiosResponse } from 'axios'
import { get, isEqual, set } from 'lodash-es'
import { config, router } from '.'
import dialog from './dialog'
import {
  fireBeforeUpdateEvent,
  fireErrorEvent,
  fireFlashEvent,
  fireInvalidEvent,
  firePrefetchedEvent,
  fireSuccessEvent,
} from './events'
import { history } from './history'
import modal from './modal'
import { page as currentPage } from './page'
import Queue from './queue'
import { RequestParams } from './requestParams'
import { SessionStorage } from './sessionStorage'
import { ActiveVisit, ErrorBag, Errors, Page } from './types'
import { hrefToUrl, isSameUrlWithoutHash, setHashIfSameUrl } from './url'

const queue = new Queue<Promise<boolean | void>>()

export class Response {
  protected wasPrefetched = false

  constructor(
    protected requestParams: RequestParams,
    protected response: AxiosResponse,
    protected originatingPage: Page,
  ) {}

  public static create(params: RequestParams, response: AxiosResponse, originatingPage: Page): Response {
    return new Response(params, response, originatingPage)
  }

  public async handlePrefetch() {
    if (isSameUrlWithoutHash(this.requestParams.all().url, window.location)) {
      this.handle()
    }
  }

  public async handle() {
    return queue.add(() => this.process())
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

    if (!this.isInertiaResponse()) {
      return this.handleNonInertiaResponse()
    }

    await history.processQueue()

    history.preserveUrl = this.requestParams.all().preserveUrl

    await this.setPage()

    const errors = currentPage.get().props.errors || {}

    if (Object.keys(errors).length > 0) {
      const scopedErrors = this.getScopedErrors(errors)

      fireErrorEvent(scopedErrors)

      return this.requestParams.all().onError(scopedErrors)
    }

    router.flushByCacheTags(this.requestParams.all().invalidateCacheTags || [])

    if (!this.wasPrefetched) {
      // We end up here other than from the prefetch cache, so we assume this response is
      // never than the cached one and therefore flush the cache.
      router.flush(currentPage.get().url)
    }

    const { flash } = currentPage.get()

    if (Object.keys(flash).length > 0) {
      fireFlashEvent(flash)
      this.requestParams.all().onFlash(flash)
    }

    fireSuccessEvent(currentPage.get())

    await this.requestParams.all().onSuccess(currentPage.get())

    history.preserveUrl = false
  }

  public mergeParams(params: ActiveVisit) {
    this.requestParams.merge(params)
  }

  public getPageResponse(): Page {
    const data = this.getDataFromResponse(this.response.data)
    return (this.response.data = { ...data, flash: data.flash ?? {} })
  }

  protected async handleNonInertiaResponse() {
    if (this.isLocationVisit()) {
      const locationUrl = hrefToUrl(this.getHeader('x-inertia-location'))

      setHashIfSameUrl(this.requestParams.all().url, locationUrl)

      return this.locationVisit(locationUrl)
    }

    const response = {
      ...this.response,
      data: this.getDataFromResponse(this.response.data),
    }

    if (fireInvalidEvent(response)) {
      return config.get('future.useDialogForErrorModal') ? dialog.show(response.data) : modal.show(response.data)
    }
  }

  protected isInertiaResponse(): boolean {
    return this.hasHeader('x-inertia')
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

  protected isLocationVisit(): boolean {
    return this.hasStatus(409) && this.hasHeader('x-inertia-location')
  }

  /**
   * @link https://inertiajs.com/redirects#external-redirects
   */
  protected locationVisit(url: URL): boolean | void {
    try {
      SessionStorage.set(SessionStorage.locationVisitKey, {
        preserveScroll: this.requestParams.all().preserveScroll === true,
      })

      if (typeof window === 'undefined') {
        return
      }

      if (isSameUrlWithoutHash(window.location, url)) {
        window.location.reload()
      } else {
        window.location.href = url.href
      }
    } catch (error) {
      return false
    }
  }

  protected async setPage(): Promise<void> {
    const pageResponse = this.getPageResponse()

    if (!this.shouldSetPage(pageResponse)) {
      return Promise.resolve()
    }

    this.mergeProps(pageResponse)
    currentPage.mergeOncePropsIntoResponse(pageResponse)
    this.preserveEqualProps(pageResponse)

    await this.setRememberedState(pageResponse)

    this.requestParams.setPreserveOptions(pageResponse)

    pageResponse.url = history.preserveUrl ? currentPage.get().url : this.pageUrl(pageResponse)

    this.requestParams.all().onBeforeUpdate(pageResponse)
    fireBeforeUpdateEvent(pageResponse)

    return currentPage.set(pageResponse, {
      replace: this.requestParams.all().replace,
      preserveScroll: this.requestParams.all().preserveScroll as boolean,
      preserveState: this.requestParams.all().preserveState as boolean,
      viewTransition: this.requestParams.all().viewTransition,
    })
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
    if (!this.requestParams.all().async) {
      // If the request is sync, we should always set the page
      return true
    }

    if (this.originatingPage.component !== pageResponse.component) {
      // We originated from a component but the response re-directed us,
      // we should respect the redirection and set the page
      return true
    }

    // At this point, if the originating request component is different than the current component,
    // the user has since navigated and we should discard the response
    if (this.originatingPage.component !== currentPage.get().component) {
      return false
    }

    const originatingUrl = hrefToUrl(this.originatingPage.url)
    const currentPageUrl = hrefToUrl(currentPage.get().url)

    // We have the same component, let's double-check the URL
    // If we're no longer on the same path name (e.g. /users/1 -> /users/2), we should not set the page
    return originatingUrl.origin === currentPageUrl.origin && originatingUrl.pathname === currentPageUrl.pathname
  }

  protected pageUrl(pageResponse: Page) {
    const responseUrl = hrefToUrl(pageResponse.url)

    setHashIfSameUrl(this.requestParams.all().url, responseUrl)

    return responseUrl.pathname + responseUrl.search + responseUrl.hash
  }

  protected preserveEqualProps(pageResponse: Page): void {
    if (pageResponse.component !== currentPage.get().component || config.get('future.preserveEqualProps') !== true) {
      return
    }

    const currentPageProps = currentPage.get().props

    Object.entries(pageResponse.props).forEach(([key, value]) => {
      if (isEqual(value, currentPageProps[key])) {
        pageResponse.props[key] = currentPageProps[key]
      }
    })
  }

  protected mergeProps(pageResponse: Page): void {
    if (!this.requestParams.isPartial() || pageResponse.component !== currentPage.get().component) {
      return
    }

    const propsToAppend = pageResponse.mergeProps || []
    const propsToPrepend = pageResponse.prependProps || []
    const propsToDeepMerge = pageResponse.deepMergeProps || []
    const matchPropsOn = pageResponse.matchPropsOn || []

    const mergeProp = (prop: string, shouldAppend: boolean) => {
      const currentProp = get(currentPage.get().props, prop)
      const incomingProp = get(pageResponse.props, prop)

      if (Array.isArray(incomingProp)) {
        const newArray = this.mergeOrMatchItems(
          (currentProp || []) as any[],
          incomingProp,
          prop,
          matchPropsOn,
          shouldAppend,
        )

        set(pageResponse.props, prop, newArray)
      } else if (typeof incomingProp === 'object' && incomingProp !== null) {
        const newObject = {
          ...(currentProp || {}),
          ...incomingProp,
        }

        set(pageResponse.props, prop, newObject)
      }
    }

    propsToAppend.forEach((prop) => mergeProp(prop, true))
    propsToPrepend.forEach((prop) => mergeProp(prop, false))

    propsToDeepMerge.forEach((prop) => {
      const currentProp = currentPage.get().props[prop]
      const incomingProp = pageResponse.props[prop]

      // Function to recursively merge objects and arrays
      const deepMerge = (target: any, source: any, matchProp: string) => {
        if (Array.isArray(source)) {
          return this.mergeOrMatchItems(target, source, matchProp, matchPropsOn)
        }

        if (typeof source === 'object' && source !== null) {
          // Merge objects by iterating over keys
          return Object.keys(source).reduce(
            (acc, key) => {
              acc[key] = deepMerge(target ? target[key] : undefined, source[key], `${matchProp}.${key}`)
              return acc
            },
            { ...target },
          )
        }

        // If the source is neither an array nor an object, simply return the it
        return source
      }

      // Apply the deep merge and update the page response
      pageResponse.props[prop] = deepMerge(currentProp, incomingProp, prop)
    })

    pageResponse.props = { ...currentPage.get().props, ...pageResponse.props }

    if (this.requestParams.isDeferredPropsRequest()) {
      const currentErrors = currentPage.get().props.errors

      if (currentErrors && Object.keys(currentErrors).length > 0) {
        // Preserve existing errors during deferred props requests
        pageResponse.props.errors = currentErrors
      }
    }

    // Preserve the existing scrollProps
    if (currentPage.get().scrollProps) {
      pageResponse.scrollProps = {
        ...(currentPage.get().scrollProps || {}),
        ...(pageResponse.scrollProps || {}),
      }
    }

    // Preserve the existing onceProps
    if (currentPage.hasOnceProps()) {
      pageResponse.onceProps = {
        ...(currentPage.get().onceProps || {}),
        ...(pageResponse.onceProps || {}),
      }
    }
  }

  protected mergeOrMatchItems(
    existingItems: any[],
    newItems: any[],
    matchProp: string,
    matchPropsOn: string[],
    shouldAppend = true,
  ) {
    const items = Array.isArray(existingItems) ? existingItems : []

    // Find the matching key for this specific property path
    const matchingKey = matchPropsOn.find((key) => {
      const keyPath = key.split('.').slice(0, -1).join('.')

      return keyPath === matchProp
    })

    // If no matching key is configured, simply concatenate the arrays
    if (!matchingKey) {
      return shouldAppend ? [...items, ...newItems] : [...newItems, ...items]
    }

    // Extract the property name we'll use to match items (e.g., 'id' from 'users.data.id')
    const uniqueProperty = matchingKey.split('.').pop() || ''

    // Create a map of new items by their unique property lookups
    const newItemsMap = new Map()

    newItems.forEach((item) => {
      if (this.hasUniqueProperty(item, uniqueProperty)) {
        newItemsMap.set(item[uniqueProperty], item)
      }
    })

    return shouldAppend
      ? this.appendWithMatching(items, newItems, newItemsMap, uniqueProperty)
      : this.prependWithMatching(items, newItems, newItemsMap, uniqueProperty)
  }

  protected appendWithMatching(
    existingItems: any[],
    newItems: any[],
    newItemsMap: Map<any, any>,
    uniqueProperty: string,
  ): any[] {
    // Update existing items with new values, keep non-matching items
    const updatedExisting = existingItems.map((item) => {
      if (this.hasUniqueProperty(item, uniqueProperty) && newItemsMap.has(item[uniqueProperty])) {
        return newItemsMap.get(item[uniqueProperty])
      }

      return item
    })

    // Filter new items to only include those not already in existing items
    const newItemsToAdd = newItems.filter((item) => {
      if (!this.hasUniqueProperty(item, uniqueProperty)) {
        return true // Always add items without unique property
      }

      return !existingItems.some(
        (existing) =>
          this.hasUniqueProperty(existing, uniqueProperty) && existing[uniqueProperty] === item[uniqueProperty],
      )
    })

    return [...updatedExisting, ...newItemsToAdd]
  }

  protected prependWithMatching(
    existingItems: any[],
    newItems: any[],
    newItemsMap: Map<any, any>,
    uniqueProperty: string,
  ): any[] {
    // Filter existing items, keeping only those not being updated
    const untouchedExisting = existingItems.filter((item) => {
      if (this.hasUniqueProperty(item, uniqueProperty)) {
        return !newItemsMap.has(item[uniqueProperty])
      }

      return true
    })

    return [...newItems, ...untouchedExisting]
  }

  protected hasUniqueProperty(item: any, property: string): boolean {
    return item && typeof item === 'object' && property in item
  }

  protected async setRememberedState(pageResponse: Page): Promise<void> {
    const rememberedState = await history.getState<Page['rememberedState']>(history.rememberedState, {})

    if (
      this.requestParams.all().preserveState &&
      rememberedState &&
      pageResponse.component === currentPage.get().component
    ) {
      pageResponse.rememberedState = rememberedState
    }
  }

  protected getScopedErrors(errors: Errors & ErrorBag): Errors {
    if (!this.requestParams.all().errorBag) {
      return errors
    }

    return errors[this.requestParams.all().errorBag || ''] || {}
  }
}
