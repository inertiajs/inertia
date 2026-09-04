import { isEqual, omit } from 'es-toolkit'
import { get, set } from 'es-toolkit/compat'
import { router } from '.'
import dialog from './dialog'
import {
  fireBeforeUpdateEvent,
  fireErrorEvent,
  fireFlashEvent,
  fireHttpExceptionEvent,
  fireLocationEvent,
  firePrefetchedEvent,
  fireSuccessEvent,
} from './events'
import { history } from './history'
import { interceptors } from './interceptors'
import {
  CarriedLayer,
  LayerLanding,
  addressOf,
  addressTierOf,
  capturedBaseIsValid,
  closeUnlandedLayer,
  isLayerResponse,
  landLayerResponse,
  layerAt,
  layerBaseOf,
  layerClosing,
  layerKeyOf,
  layersOf,
  loadingBase,
  openLayerFor,
  promoteDeepestLayer,
  tierOf,
  withTier,
} from './layers'
import { page as currentPage } from './page'
import { partialReloadRequestsProp } from './partialReload'
import Queue from './queue'
import { RequestParams } from './requestParams'
import { SessionStorage } from './sessionStorage'
import {
  ActiveVisit,
  BaseSnapshot,
  ErrorBag,
  Errors,
  HttpResponse,
  Layer,
  LayerState,
  Page,
  PageProps,
  VisitOptions,
} from './types'
import { hrefToUrl, isSameUrlWithoutHash, setHashIfSameUrl, urlWithoutHash } from './url'

const responseQueue = new Queue<Promise<boolean | void>>()

// What a marked detour stashed, so the return trip composes over the page the user was on.
interface InterstitialCarry {
  layer: CarriedLayer
  dispatchedUrl: string
}

let interstitialCarry: InterstitialCarry | undefined

// Only the layer the detour interrupted may claim the stash, never one opened on the prompt.
const interstitialCarryFor = (url: string): InterstitialCarry | undefined =>
  interstitialCarry && isSameUrlWithoutHash(hrefToUrl(interstitialCarry.dispatchedUrl), hrefToUrl(url))
    ? interstitialCarry
    : undefined

export const landWalk = (walkedFrom: number): Promise<void> => {
  const page = currentPage.get()

  if (walkedFrom !== currentPage.generation()) {
    return Promise.resolve()
  }

  if (!layerClosing.withoutClosingLayers(page).layers?.length) {
    // Nothing to promote: the page is the blank base, which never renders. Re-request its own url.
    return Promise.resolve(router.visit(page.url, { replace: true, preserveScroll: true, preserveState: true }))
  }

  return currentPage.set(promoteDeepestLayer(page), {
    replace: true,
    preserveScroll: true,
    preserveState: true,
    preservesBase: true,
  })
}

export const walkTo = (base: string): void => {
  const walkedFrom = currentPage.generation()

  // A hop that brings back no page leaves the stack drawn over a base that is never coming.
  const land = () => {
    responseQueue.add(() => landWalk(walkedFrom))

    return false
  }

  router.visit(base, {
    walk: true,
    async: true,
    replace: true,
    preserveScroll: true,
    preserveState: true,
    onHttpException: land,
    onNetworkError: land,
  } as VisitOptions & { walk: true })
}

function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item)
}

function hasUniqueProperty(item: any, property: string): boolean {
  return item && typeof item === 'object' && property in item
}

function appendWithMatching(
  existingItems: any[],
  newItems: any[],
  newItemsMap: Map<any, any>,
  uniqueProperty: string,
): any[] {
  // Update existing items with new values, keep non-matching items
  const updatedExisting = existingItems.map((item) => {
    if (hasUniqueProperty(item, uniqueProperty) && newItemsMap.has(item[uniqueProperty])) {
      return newItemsMap.get(item[uniqueProperty])
    }

    return item
  })

  // Filter new items to only include those not already in existing items
  const newItemsToAdd = newItems.filter((item) => {
    if (!hasUniqueProperty(item, uniqueProperty)) {
      return true // Always add items without unique property
    }

    return !existingItems.some(
      (existing) => hasUniqueProperty(existing, uniqueProperty) && existing[uniqueProperty] === item[uniqueProperty],
    )
  })

  return [...updatedExisting, ...newItemsToAdd]
}

function prependWithMatching(
  existingItems: any[],
  newItems: any[],
  newItemsMap: Map<any, any>,
  uniqueProperty: string,
): any[] {
  // Filter existing items, keeping only those not being updated
  const untouchedExisting = existingItems.filter((item) => {
    if (hasUniqueProperty(item, uniqueProperty)) {
      return !newItemsMap.has(item[uniqueProperty])
    }

    return true
  })

  return [...newItems, ...untouchedExisting]
}

function mergeOrMatchItems(
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
    if (hasUniqueProperty(item, uniqueProperty)) {
      newItemsMap.set(item[uniqueProperty], item)
    }
  })

  return shouldAppend
    ? appendWithMatching(items, newItems, newItemsMap, uniqueProperty)
    : prependWithMatching(items, newItems, newItemsMap, uniqueProperty)
}

function mergeProp(
  pageResponse: Page,
  currentProps: PageProps,
  prop: string,
  shouldAppend: boolean,
  matchPropsOn: string[],
): void {
  const currentProp = get(currentProps, prop)
  const incomingProp = get(pageResponse.props, prop)

  if (Array.isArray(incomingProp)) {
    const newArray = mergeOrMatchItems((currentProp || []) as any[], incomingProp, prop, matchPropsOn, shouldAppend)

    set(pageResponse.props, prop, newArray)
  } else if (typeof incomingProp === 'object' && incomingProp !== null) {
    const newObject = {
      ...(currentProp || {}),
      ...incomingProp,
    }

    set(pageResponse.props, prop, newObject)
  }
}

function deepMergeProp(target: any, source: any, matchProp: string, matchPropsOn: string[]): any {
  if (Array.isArray(source)) {
    return mergeOrMatchItems(target, source, matchProp, matchPropsOn)
  }

  if (typeof source === 'object' && source !== null) {
    // Merge objects by iterating over keys
    return Object.keys(source).reduce(
      (acc, key) => {
        acc[key] = deepMergeProp(target ? target[key] : undefined, source[key], `${matchProp}.${key}`, matchPropsOn)
        return acc
      },
      { ...target },
    )
  }

  // If the source is neither an array nor an object, simply return it
  return source
}

function deepMergeObjects(target: PageProps, source: PageProps): PageProps {
  const result = { ...target }

  for (const key of Object.keys(source)) {
    const targetValue = target[key]
    const sourceValue = source[key]

    if (isObject(targetValue) && isObject(sourceValue)) {
      result[key] = deepMergeObjects(targetValue as PageProps, sourceValue as PageProps)
    } else {
      result[key] = sourceValue
    }
  }

  return result
}

function mergePropsInto(pageResponse: Page, currentProps: PageProps, nestedProps: string[]): void {
  const matchPropsOn = pageResponse.matchPropsOn || []

  ;(pageResponse.mergeProps || []).forEach((prop) => mergeProp(pageResponse, currentProps, prop, true, matchPropsOn))
  ;(pageResponse.prependProps || []).forEach((prop) => mergeProp(pageResponse, currentProps, prop, false, matchPropsOn))
  ;(pageResponse.deepMergeProps || []).forEach((prop) => {
    const currentProp = get(currentProps, prop)
    const incomingProp = get(pageResponse.props, prop)

    set(pageResponse.props, prop, deepMergeProp(currentProp, incomingProp, prop, matchPropsOn))
  })

  const nestedTopKeys = new Set(nestedProps.filter((prop) => prop.includes('.')).map((prop) => prop.split('.')[0]))

  for (const key of nestedTopKeys) {
    const currentValue = currentProps[key]

    if (isObject(currentValue) && isObject(pageResponse.props[key])) {
      pageResponse.props[key] = deepMergeObjects(currentValue as PageProps, pageResponse.props[key] as PageProps)
    }
  }

  pageResponse.props = { ...currentProps, ...pageResponse.props }
}

// Where a response lands and what the write that installs it has to preserve. Resolved up front so
// the flags are decided in one place rather than read back out of the page as it is being built.
interface LandingDecision {
  base: Page
  composesAsLayer: boolean
  walksBeneath: boolean
  keepsStack: boolean
  refreshesBase: boolean
  carriedReturn: boolean
  handedBackTo: LayerState | undefined
  carried: CarriedLayer
}

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
        this.closeLayerAttempt()
        return
      }

      if (!fireHttpExceptionEvent(response)) {
        this.closeLayerAttempt()
        return
      }
    }

    const data = this.getDataFromResponse(this.response.data)

    if (data && data.close) {
      const { layerId } = this.requestParams.all()
      // A close is never installed: it closes the layer the visit was made from, or the top one when
      // it named none. One whose layer has gone since has nothing of its own left to close.
      const closes = layerId === undefined ? layersOf(currentPage.get()).at(-1) : layerAt(currentPage.get(), layerId)

      if (closes) {
        // Not awaited: the close refreshes what it lands on, and that response queues behind this one.
        router.close(closes.id)
      } else {
        router.reload()
      }

      this.closeLayerAttempt()

      router.flushByCacheTags(this.requestParams.all().invalidateCacheTags || [])

      // The visit succeeded even though nothing installed. The closing layers are still on screen
      // running their exit, so the page the callbacks see is the one the close leaves behind.
      const landsOn = layerClosing.withoutClosingLayers(currentPage.get())

      fireSuccessEvent(landsOn, { visitId: this.requestParams.all().id })

      return this.requestParams.all().onSuccess(landsOn)
    }

    await history.processQueue()

    history.preserveUrl = this.requestParams.all().preserveUrl

    const landedOn = await this.setPage()

    const page = currentPage.get()
    const tier = landedOn === undefined ? page : layerAt(page, landedOn)

    if (tier) {
      const { flash } = tier

      if (Object.keys(flash).length > 0 && !this.requestParams.isDeferredPropsRequest()) {
        fireFlashEvent(flash)
        this.requestParams.all().onFlash(flash)
      }

      const errors = (tier.props.errors || {}) as Errors & ErrorBag

      if (Object.keys(errors).length > 0) {
        const scopedErrors = this.getScopedErrors(errors)

        fireErrorEvent(scopedErrors, { page, visitId: this.requestParams.all().id })

        return this.requestParams.all().onError(scopedErrors)
      }
    }

    router.flushByCacheTags(this.requestParams.all().invalidateCacheTags || [])

    if (!this.wasPrefetched) {
      // We end up here other than from the prefetch cache, so we assume this response is
      // newer than the cached one and therefore flush the cache.
      router.flush(tier?.url ?? page.url)
    }

    fireSuccessEvent(currentPage.get(), { visitId: this.requestParams.all().id })

    await this.requestParams.all().onSuccess(currentPage.get())

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
    // Nothing below installs a layer: every path either navigates away or shows the error.
    this.closeLayerAttempt()

    if (this.isInertiaRedirect()) {
      // The layer target is dropped, so a redirected layer reload lands as a base navigation.
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
    // Composing onto a stack the browser is stepping out of would reopen what the user just closed.
    await layerClosing.unwindSettled()

    const pageResponse = this.getPageResponse()

    if (!this.shouldSetPage(pageResponse)) {
      this.closeLayerAttempt()
      return undefined
    }

    this.response = await interceptors.processResponse(this.requestParams.all(), this.response)

    this.mergeProps(pageResponse)
    currentPage.mergeOncePropsIntoResponse(pageResponse, { layerId: this.requestParams.all().layerId })
    this.preserveOptimisticProps(pageResponse)
    this.preserveEqualProps(pageResponse)

    await this.setRememberedState(pageResponse)

    this.requestParams.setPreserveOptions(pageResponse)

    // `preserveUrl` puts the base's url on the response, so the layer's own is held here.
    const responseUrl = this.pageUrl(pageResponse)

    pageResponse.url = history.preserveUrl ? currentPage.get().url : responseUrl

    const decision = await this.resolveLanding(pageResponse, responseUrl)

    const landing = landLayerResponse({
      base: decision.base,
      response: pageResponse,
      responseUrl,
      composesAsLayer: decision.composesAsLayer,
      walksBeneath: decision.walksBeneath,
      // The layer's own component is kept only when the visit asked for it, as the base's is.
      remount: !this.requestParams.all().preserveState,
      carried: decision.carried,
      preserveUrl: history.preserveUrl,
      keepsStack: decision.keepsStack,
    })

    if (decision.handedBackTo) {
      this.handErrorsBack(landing, pageResponse, decision.handedBackTo)
    }

    await this.writeLanding(landing, decision)

    return landing.landedOn
  }

  // Which base the response composes onto and what the landing does with it. Closing the stack down
  // to the layer being answered happens here, so the base returned is the one the landing sees.
  protected async resolveLanding(pageResponse: Page, responseUrl: string): Promise<LandingDecision> {
    let base = currentPage.get()
    const isLayer = isLayerResponse(pageResponse)
    const walksBeneath = this.requestParams.isWalkRequest()

    const handedBackTo = this.errorsHandedBackTo(pageResponse)
    const refreshesBase = this.refreshesBase(pageResponse) || handedBackTo !== undefined
    const keepsStack = (this.keepsStack(pageResponse) || handedBackTo !== undefined) && layersOf(base).length > 0

    if (!isLayer && !walksBeneath) {
      this.carryOrEndDetour(pageResponse)
    }

    // A carried return composes over the base its stash holds, which the clauses below cannot see.
    const carry = interstitialCarryFor(responseUrl)
    const composesAsLayer =
      !walksBeneath && isLayer && (carry !== undefined || this.hasValidCapturedBase(pageResponse, responseUrl, base))

    if (composesAsLayer) {
      base = await this.closeLayersAbove(pageResponse, base, handedBackTo)
      this.mergeIntoOpenLayer(pageResponse, base)
    }

    return {
      base,
      composesAsLayer,
      walksBeneath,
      keepsStack,
      refreshesBase,
      carriedReturn: composesAsLayer && carry !== undefined,
      handedBackTo,
      carried: carry?.layer ?? this.carriedLayer(base),
    }
  }

  // A link four layers deep can name a layer that is not the top one, so the stack closes down to it
  // before the response lands. A refresh in place names no level: a poll or a deferred group filling
  // in under an open layer leaves that layer where it is. Neither does a form handed back to a layer
  // standing above the address it was submitted from.
  protected async closeLayersAbove(
    pageResponse: Page,
    base: Page,
    handedBackTo: LayerState | undefined,
  ): Promise<Page> {
    if (this.refreshesInPlace() || handedBackTo !== undefined) {
      return base
    }

    await layerClosing.closeAbove(openLayerFor(base, pageResponse, this.requestParams.all().layerId)?.id)

    return currentPage.get()
  }

  // A partial answering a layer that is already open rewrites that layer where it stands, so what it
  // left out is taken from the props the layer is holding rather than dropped.
  protected mergeIntoOpenLayer(pageResponse: Page, base: Page): void {
    const open = openLayerFor(base, pageResponse, this.requestParams.all().layerId)

    if (open && this.requestParams.isPartial() && open.component === pageResponse.component) {
      this.mergeIntoTier(pageResponse, open)
    }
  }

  // The errors belong to the tier that submitted, not to the one the response landed on, so they are
  // moved back onto it along with the flash the landing carried.
  protected handErrorsBack(landing: LayerLanding, pageResponse: Page, handedBackTo: LayerState): void {
    const landedOn = tierOf(landing.page, landing.landedOn)

    landing.page = withTier(
      withTier(landing.page, landing.landedOn, { props: { ...landedOn.props, errors: {} }, flash: {} }),
      handedBackTo.id,
      { props: { ...handedBackTo.props, errors: pageResponse.props.errors }, flash: landedOn.flash },
    )
    landing.landedOn = handedBackTo.id
  }

  protected async writeLanding(
    landing: LayerLanding,
    { composesAsLayer, walksBeneath, refreshesBase, carriedReturn, handedBackTo }: LandingDecision,
  ): Promise<void> {
    const page = landing.page
    const landsOverTheStack = composesAsLayer || handedBackTo !== undefined

    history.preserveUrl = landing.preserveUrl

    if (carriedReturn) {
      interstitialCarry = undefined
    }

    if (landing.landedOn === undefined) {
      // The open never landed, so its handle is spent. Fired ahead of the page that replaces it.
      this.closeLayerAttempt()
    }

    this.requestParams.all().onBeforeUpdate(page)
    fireBeforeUpdateEvent(page)

    await currentPage.set(page, {
      // The layer's entry takes the prompt's place, so back lands on the base, not a dead prompt.
      replace: carriedReturn || this.requestParams.all().replace,
      preserveScroll: landsOverTheStack || (this.requestParams.all().preserveScroll as boolean),
      preserveState: landsOverTheStack || (this.requestParams.all().preserveState as boolean),
      preservesBase: landsOverTheStack || walksBeneath || refreshesBase,
      viewTransition: this.requestParams.all().viewTransition,
      cached: this.requestParams.all().cached,
      visitId: this.requestParams.all().id,
    })

    if (landing.walksTo !== undefined) {
      walkTo(landing.walksTo)
    } else if (walksBeneath) {
      // The write can be superseded while its component resolves, by a close's own write say, and
      // what superseded it still shows the blank. This response is spent, so the walk is sent again.
      const base = loadingBase(currentPage.get())

      if (base !== undefined) {
        walkTo(base)
      }
    }
  }

  // A marked non-layer response is a prompt the user will return from, so the base it was dispatched
  // from is stashed before the prompt installs. The mark alone says so: a plain visit the server
  // answers with a layer once the prompt is done is the same detour, and the client has no layer of
  // its own to recognise it by. An unmarked landing ends any pending detour.
  protected carryOrEndDetour(pageResponse: Page): void {
    const { url, layerOwner } = this.requestParams.all()

    // A prompt answering its own submit, a wrong password say, is the detour already running. Only
    // an open of its own starts a second one, retiring the attempt the old stash was pausing.
    if (pageResponse.interstitial && interstitialCarry && layerOwner === undefined) {
      return
    }

    if (interstitialCarry) {
      // The detour it was holding is not coming back, so the attempt it paused is spent after all.
      closeUnlandedLayer(currentPage.get(), interstitialCarry.layer.layerId)
    }

    interstitialCarry = pageResponse.interstitial
      ? { layer: this.carriedLayer(this.capturedBase.page), dispatchedUrl: urlWithoutHash(url).href }
      : undefined
  }

  protected carriedLayer(base: Page): CarriedLayer {
    const { layerId, layerOwner } = this.requestParams.all()

    return {
      base,
      layerId,
      opening: layerOwner !== undefined,
      owner: layerOwner ?? layerAt(base, layerId)?.id ?? currentPage.id(),
      claims: this.requestParams.fabricatedLayer(),
    }
  }

  protected closeLayerAttempt(): void {
    const { layerId } = this.requestParams.all()

    // A marked detour returns to this layer, so its attempt is paused rather than spent.
    if (interstitialCarry?.layer.layerId === layerId) {
      return
    }

    closeUnlandedLayer(currentPage.get(), layerId)
  }

  protected hasValidCapturedBase(pageResponse: Page, layerUrl: string, base: Page): boolean {
    const { layerId, layerOwner } = this.requestParams.all()

    return capturedBaseIsValid({
      captured: this.capturedBase,
      live: { page: base, generation: currentPage.generation() },
      dispatchedUrl: this.requestParams.all().url,
      dispatchedFrom: layerOwner ?? layerId,
      opening: layerOwner !== undefined,
      layer: { url: layerUrl, key: layerKeyOf(pageResponse), base: layerBaseOf(pageResponse) },
    })
  }

  // A layer response for a visit aimed at a layer that has since closed has nowhere to land: it
  // would either reopen what the user dismissed or, having no valid base left, tear the page down
  // to walk one back. An open carries no tier yet, so it is exempt.
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

    // Read against the tier the request was aimed at: what says a layer has moved on is its own
    // component and url changing, neither of which the page beneath it carries.
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

  protected pageUrl(pageResponse: Page) {
    const responseUrl = hrefToUrl(pageResponse.url)

    if (pageResponse.preserveFragment) {
      responseUrl.hash = this.requestParams.all().url.hash
    } else {
      setHashIfSameUrl(this.requestParams.all().url, responseUrl)
    }

    return responseUrl.pathname + responseUrl.search + responseUrl.hash
  }

  protected preserveOptimisticProps(pageResponse: Page): void {
    if (!router.hasPendingOptimistic()) {
      return
    }

    const layer = isLayerResponse(pageResponse)
      ? openLayerFor(currentPage.get(), pageResponse, this.requestParams.all().layerId)
      : undefined

    for (const key of Object.keys(pageResponse.props)) {
      if (currentPage.hasBaseline(key, layer?.id)) {
        currentPage.updateBaseline(key, pageResponse.props[key], layer?.id)
        pageResponse.props[key] = (layer ? layer.props : currentPage.get().props)[key]
      }
    }
  }

  // Read against the tier the response is landing on: a layer's props have nothing in common with
  // the base's, so sharing what happens to be equal between them would be sharing across tiers.
  protected preserveEqualProps(pageResponse: Page): void {
    const tier = isLayerResponse(pageResponse)
      ? openLayerFor(currentPage.get(), pageResponse, this.requestParams.all().layerId)
      : currentPage.get()

    if (!tier || tier.component !== pageResponse.component) {
      return
    }

    Object.entries(pageResponse.props).forEach(([key, value]) => {
      if (isEqual(value, tier.props[key])) {
        pageResponse.props[key] = tier.props[key]
      }
    })
  }

  protected refreshesInPlace(): boolean {
    return this.requestParams.isPartial() || this.requestParams.isReload()
  }

  // The stack stands over the refreshed base. A blank base takes whatever fills it in, being a
  // placeholder a walk left.
  protected keepsStack(pageResponse: Page): boolean {
    return this.refreshesInPlace() && (this.staysOnBaseComponent(pageResponse) || currentPage.get().component === '')
  }

  protected refreshesBase(pageResponse: Page): boolean {
    return this.refreshesInPlace() && this.landsOnTheBase(pageResponse)
  }

  protected landsOnTheBase(pageResponse: Page): boolean {
    return (
      this.staysOnBaseComponent(pageResponse) &&
      isSameUrlWithoutHash(hrefToUrl(pageResponse.url), hrefToUrl(currentPage.get().url))
    )
  }

  // A layer that does not own the address, one with no url of its own say, is submitted from the
  // address of the tier beneath it, so that is where its errors and flash come back. A response arriving there
  // unchanged is the server handing the form back, not a navigation.
  protected errorsHandedBackTo(pageResponse: Page): LayerState | undefined {
    const page = currentPage.get()
    const layer = layerAt(page, this.requestParams.all().layerId)
    const address = addressTierOf(page)

    return layer &&
      address !== layer &&
      Object.keys(pageResponse.props.errors ?? {}).length > 0 &&
      pageResponse.component === address.component &&
      isSameUrlWithoutHash(hrefToUrl(pageResponse.url), hrefToUrl(addressOf(page)))
      ? layer
      : undefined
  }

  protected staysOnBaseComponent(pageResponse: Page): boolean {
    return pageResponse.component === currentPage.get().component
  }

  protected mergeProps(pageResponse: Page): void {
    if (!this.requestParams.isPartial() || !this.staysOnBaseComponent(pageResponse) || isLayerResponse(pageResponse)) {
      return
    }

    this.mergeIntoTier(pageResponse, currentPage.get())
  }

  protected mergeIntoTier(pageResponse: Page, tier: Layer): void {
    mergePropsInto(pageResponse, tier.props, this.nestedProps())

    if (this.shouldPreserveErrors(pageResponse, tier)) {
      pageResponse.props.errors = tier.props.errors as Errors & ErrorBag
    }

    if (tier.scrollProps) {
      pageResponse.scrollProps = { ...tier.scrollProps, ...pageResponse.scrollProps }
    }

    if (Object.keys(tier.onceProps ?? {}).length > 0) {
      pageResponse.onceProps = { ...tier.onceProps, ...pageResponse.onceProps }
    }

    if (Object.keys(tier.initialDeferredProps ?? {}).length > 0) {
      pageResponse.initialDeferredProps = tier.initialDeferredProps
    }

    if (this.requestParams.isDeferredPropsRequest()) {
      pageResponse.flash = { ...tier.flash }
    }

    pageResponse.rescuedProps = this.mergedRescued(pageResponse, tier.rescuedProps)
  }

  protected nestedProps(): string[] {
    return [...this.requestParams.all().only, ...this.requestParams.all().except]
  }

  protected mergedRescued(pageResponse: Page, current: string[] = []): string[] {
    const rescued = new Set(current.filter((prop) => !partialReloadRequestsProp(this.requestParams.all(), prop)))

    ;(pageResponse.rescuedProps ?? []).forEach((prop) => rescued.add(prop))

    return Array.from(rescued)
  }

  protected shouldPreserveErrors(pageResponse: Page, tier: Layer): boolean {
    if (!this.requestParams.all().preserveErrors) {
      return false
    }

    const currentErrors = tier.props.errors as Errors | undefined

    if (!currentErrors || Object.keys(currentErrors).length === 0) {
      return false
    }

    const responseErrors = pageResponse.props.errors

    if (responseErrors && Object.keys(responseErrors).length > 0) {
      return false
    }

    return true
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
