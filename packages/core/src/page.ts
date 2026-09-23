import { cloneDeep } from 'es-toolkit'
import { eventHandler } from './eventHandler'
import { fireNavigateEvent } from './events'
import { history } from './history'
import { interceptors } from './interceptors'
import {
  addressOf,
  dropHistoryEntry,
  isBlankBase,
  layerAt,
  layersOf,
  loadingBase,
  mapLayers,
  recordHistoryEntry,
  tierOf,
  withBrowserHash,
  withTier,
  withoutAbandonedMarks,
} from './layers'
import { registryClose } from './layers/handles'
import { resolveLayers } from './layers/render'
import { continueWalk } from './layers/walk'
import { prefetchedRequests } from './prefetched'
import { Scroll } from './scroll'
import {
  Component,
  FlashData,
  LoadingResolver,
  Page,
  PageEvent,
  PageHandler,
  PageResolver,
  ResolvedLayer,
  RouterInitParams,
  ScrollRegion,
  Tier,
  Visit,
} from './types'
import { hrefToUrl, isSameUrlWithoutHash } from './url'

const tiersOf = (page: Page): [string | undefined, Tier][] => [
  ...layersOf(page).map((layer): [string, Tier] => [layer.id, layer]),
  [undefined, page],
]

const pendingDeferred = new Map<string | undefined, Pick<Tier, 'deferredProps' | 'component' | 'url'>>()

const recordDeferredProps = (page: Page, onScreen?: Page): void => {
  const carried = new Map(onScreen ? tiersOf(onScreen).map(([key, tier]) => [key, tier.deferredProps]) : [])

  for (const [key, tier] of tiersOf(page)) {
    if (Object.keys(tier.deferredProps ?? {}).length && tier.deferredProps !== carried.get(key)) {
      pendingDeferred.set(key, { deferredProps: tier.deferredProps, component: tier.component, url: tier.url })
    }
  }
}

const announceDeferredProps = (page: Page): void => {
  const tiers = tiersOf(page)
  const open = new Set(tiers.map(([key]) => key))

  for (const key of pendingDeferred.keys()) {
    if (!open.has(key)) {
      pendingDeferred.delete(key)
    }
  }

  for (const [key, tier] of tiers) {
    const owed = pendingDeferred.get(key)

    if (!owed) {
      continue
    }

    pendingDeferred.delete(key)

    if (owed.component !== tier.component || owed.url !== tier.url) {
      continue
    }

    eventHandler.fireInternalEvent('loadDeferredProps', { deferredProps: owed.deferredProps, layerId: key })
  }
}

const withLiveOwners = (page: Page, baseId: string): Page => {
  const open = new Set(layersOf(page).map((layer) => layer.id))

  return mapLayers(page, (layer) =>
    layer.owner !== null && !open.has(layer.owner) ? { ...layer, owner: baseId } : layer,
  )
}

const withoutFlash = (page: Page): Page => ({
  ...mapLayers(page, (layer) => ({ ...layer, flash: {} })),
  flash: {},
})

let baseSequence = 0

const nextBaseId = (): string => `base-${++baseSequence}`

interface SetOptions {
  replace?: boolean
  preserveScroll?: boolean
  preserveState?: boolean
  viewTransition?: Visit['viewTransition']
  cached?: boolean
  initialRender?: boolean
  preservesBase?: boolean
  visitId?: string
}

interface InstallOptions extends SetOptions {
  replace: boolean
  scrollRegions: ScrollRegion[]
  scrollRegionLayers?: (string | null)[]
}

class CurrentPage {
  protected page!: Page
  protected swapComponent!: PageHandler<any>
  protected resolveComponent!: PageResolver
  protected resolveLoading?: LoadingResolver
  protected onFlashCallback?: (flash: Page['flash']) => void
  protected componentId = {}
  protected baseGeneration = 0
  protected baseId = ''
  protected listeners: {
    event: PageEvent
    callback: VoidFunction
  }[] = []
  protected isFirstPageLoad = true
  protected cleared = false
  protected historyQuotaExceeded = false
  protected optimisticBaselines: Map<string | undefined, Partial<Page['props']>> = new Map()
  protected pendingOptimistics: {
    id: number
    layerId?: string
    callback: (props: Page['props']) => Partial<Page['props']> | void
  }[] = []
  protected optimisticCounter = 0
  protected confirmedOptimisticId = 0

  public init<ComponentType = Component>({
    initialPage,
    swapComponent,
    resolveComponent,
    resolveLoading,
    onFlash,
  }: RouterInitParams<ComponentType>) {
    this.page = { ...initialPage, flash: initialPage.flash ?? {}, rescuedProps: initialPage.rescuedProps ?? [] }
    this.swapComponent = swapComponent
    this.resolveComponent = resolveComponent
    this.resolveLoading = resolveLoading
    this.onFlashCallback = onFlash
    this.baseId = nextBaseId()

    eventHandler.on('historyQuotaExceeded', () => {
      this.historyQuotaExceeded = true
    })

    return this
  }

  protected commit(page: Page, { announceAll = false }: { announceAll?: boolean } = {}): void {
    const previous = announceAll ? [] : layersOf(this.page)
    const next = layersOf(page)
    const before = new Set(previous.map((layer) => layer.id))
    const after = new Set(next.map((layer) => layer.id))

    this.page = page

    const departed = previous.filter((layer) => !after.has(layer.id))

    this.dropLayerOptimisticState(departed.map((layer) => layer.id))
    departed.forEach((layer) => interceptors.fireLayerEvent({ type: 'closed', layer }))
    next
      .filter((layer) => !before.has(layer.id))
      .forEach((layer) => interceptors.fireLayerEvent({ type: 'opened', layer }))

    this.fireEventsFor('commit')
  }

  public set(page: Page, options: SetOptions = {}): Promise<void> {
    const { initialRender = false, preservesBase = false } = options

    if (Object.keys(page.deferredProps || {}).length && page.initialDeferredProps === undefined) {
      // Preserve original deferred props for back button handling
      page.initialDeferredProps = page.deferredProps
    }

    recordDeferredProps(page, initialRender ? undefined : this.page)

    if (!preservesBase) {
      this.baseGeneration++
    }

    page = withoutAbandonedMarks(this.page, page)

    this.componentId = {}

    const componentId = this.componentId

    if (page.clearHistory) {
      history.clear()
      page = { ...page, clearHistory: false }
    }

    return Promise.all([this.resolve(page.component, page), this.resolveLayers(page)]).then(([component, layers]) => {
      if (componentId !== this.componentId) {
        // Component has changed since we started resolving this component, bail
        return
      }

      return this.write(page, component, layers, options)
    })
  }

  // The history entry is written before the swap, so anything reading the address mid-swap sees the new one.
  protected write(
    page: Page,
    component: Component | undefined,
    layers: ResolvedLayer[] | undefined,
    options: SetOptions,
  ): Promise<void> {
    const { preserveScroll = false, preserveState = false, preservesBase = false } = options

    if (!preservesBase && this.takesBaseAway(page, preserveState)) {
      registryClose(this.baseId)
      this.baseId = nextBaseId()
    }

    page = withLiveOwners(page, this.baseId)

    page.rememberedState ??= {}

    const isServer = typeof window === 'undefined'
    const scrollRegions = !isServer && preserveScroll ? Scroll.getScrollRegions() : []
    const scrollRegionLayers = !isServer && preserveScroll ? Scroll.getScrollRegionLayers() : undefined
    const replace = this.takesOverTheEntry(page, options.replace ?? false, isServer)

    if (!replace && !history.preserveUrl) {
      page = recordHistoryEntry(page)
    }

    // Clear flash data from the page object, we don't want it when navigating back/forward...
    const pageForHistory = withoutFlash(page)

    return new Promise<boolean>((resolve) =>
      replace ? history.replaceState(pageForHistory, () => resolve(true)) : history.pushState(pageForHistory, resolve),
    ).then((written) =>
      // An entry the browser refused to write is not one a close should step back over.
      this.install(written ? page : dropHistoryEntry(page), component, layers, {
        ...options,
        replace,
        scrollRegions,
        scrollRegionLayers,
      }),
    )
  }

  protected takesOverTheEntry(page: Page, replace: boolean, isServer: boolean): boolean {
    if (replace) {
      return true
    }

    if (layersOf(page).some((layer) => !layer.standalone && !layerAt(this.page, layer.id))) {
      return false
    }

    return isSameUrlWithoutHash(hrefToUrl(addressOf(page)), !isServer ? window.location : new URL(page.url))
  }

  protected install(
    page: Page,
    component: Component | undefined,
    layers: ResolvedLayer[] | undefined,
    { preserveState = false, viewTransition = false, initialRender = false, ...options }: InstallOptions,
  ): Promise<void> | void {
    const isNewComponent = !this.isTheSame(page)

    if (!isNewComponent && Object.keys(page.props.errors || {}).length > 0) {
      // Don't use view transition if the page stays the same and there are (new) errors...
      viewTransition = false
    }

    this.commit(page, { announceAll: initialRender })
    this.cleared = false

    if (this.hasOnceProps()) {
      prefetchedRequests.updateCachedOncePropsFromCurrentPage()
    }

    if (isNewComponent) {
      this.fireEventsFor('newComponent')
    }

    if (this.isFirstPageLoad) {
      this.fireEventsFor('firstLoad')
    }

    this.isFirstPageLoad = false

    if (this.historyQuotaExceeded) {
      // If we exceeded the history quota, don't attempt to swap the
      // component as we're performing a full page reload instead.
      this.historyQuotaExceeded = false
      return
    }

    return this.swap({ component, layers, page, preserveState, viewTransition, initialRender }).then(() =>
      this.afterSwap(page, options),
    )
  }

  protected afterSwap(
    page: Page,
    { preserveScroll = false, scrollRegions, scrollRegionLayers, replace, cached = false, visitId }: InstallOptions,
  ): void {
    if (preserveScroll) {
      // Scroll regions must be explicitly restored since the DOM elements are destroyed
      // and recreated during the component 'swap'. Document scroll is naturally
      // preserved as the document element itself persists across navigations.
      window.requestAnimationFrame(() => Scroll.restoreScrollRegions(scrollRegions, scrollRegionLayers))
    } else {
      Scroll.reset()
    }

    announceDeferredProps(page)

    if (!replace) {
      fireNavigateEvent(page, { cached, visitId })
    }

    continueWalk()
  }

  public setQuietly(
    page: Page,
    {
      preserveState = false,
    }: {
      preserveState?: boolean
    } = {},
  ) {
    page = withLiveOwners(page, this.baseId)

    this.baseGeneration++
    page = withoutAbandonedMarks(this.page, page)

    return this.resolve(page.component, page).then(async (component) => {
      const layers = await this.resolveLayers(page)

      this.commit(page)
      this.cleared = false
      history.setCurrent(page)
      return this.swap({ component, layers, page, preserveState, viewTransition: false })
    })
  }

  public clear(): void {
    this.cleared = true
  }

  public isCleared(): boolean {
    return this.cleared
  }

  public get(): Page {
    return this.page
  }

  public generation(): number {
    return this.baseGeneration
  }

  public id(): string {
    return this.baseId
  }

  protected takesBaseAway(page: Page, preserveState: boolean): boolean {
    return !layersOf(page).some((open) => layerAt(this.page, open.id)) && !(preserveState && this.isTheSame(page))
  }

  public getWithoutFlashData(): Page {
    return withoutFlash(this.page)
  }

  public hasOnceProps(): boolean {
    return tiersOf(this.page).some(([, tier]) => Object.keys(tier.onceProps ?? {}).length > 0)
  }

  public merge(data: Partial<Page>): void {
    this.commit({ ...this.page, ...data })
  }

  public setPropsQuietly(props: Page['props'], layerId?: string): Promise<unknown> {
    this.page = withTier(this.page, layerId, { props })

    return this.rerender()
  }

  public rerender(): Promise<void> {
    return Promise.all([this.resolve(this.page.component, this.page), this.resolveLayers(this.page)]).then(
      ([component, layers]) =>
        this.swap({ component, layers, page: this.page, preserveState: true, viewTransition: false }).then(() => {}),
    )
  }

  public setFlash(flash: FlashData, layerId?: string): void {
    this.page = withTier(this.page, layerId, { flash })

    if (layerId) {
      this.rerender()

      return
    }

    this.onFlashCallback?.(flash)
  }

  public setUrlHash(hash: string): void {
    this.page = withBrowserHash(this.page, hash)
  }

  public remember(data: Page['rememberedState']): void {
    this.page.rememberedState = data
  }

  public swap({
    component,
    layers,
    page,
    preserveState,
    viewTransition,
    initialRender = false,
  }: {
    component?: Component
    layers?: ResolvedLayer[]
    page: Page
    preserveState: boolean
    viewTransition: Visit['viewTransition']
    initialRender?: boolean
  }): Promise<unknown> {
    const doSwap = () => this.swapComponent({ component, layers, page, preserveState, initialRender })

    if (!viewTransition || !document?.startViewTransition || document.visibilityState === 'hidden') {
      return doSwap()
    }

    const viewTransitionCallback = typeof viewTransition === 'boolean' ? () => null : viewTransition

    // The browser skips this transition when a newer one supersedes it, when the tab goes hidden
    // mid-flight, or when the swap times out, always rejecting with a DOMException. That's
    // expected, so swallow it and let a failing swap reject as it normally would.
    const ignoreSkippedTransition = (promise: Promise<unknown>) => {
      promise.catch((error) => {
        if (!(error instanceof DOMException)) {
          throw error
        }
      })
    }

    return new Promise((resolve) => {
      const transitionResult = document.startViewTransition(() => doSwap().then(resolve))

      ignoreSkippedTransition(transitionResult.ready)
      ignoreSkippedTransition(transitionResult.finished)
      ignoreSkippedTransition(transitionResult.updateCallbackDone)

      viewTransitionCallback(transitionResult)
    })
  }

  public resolve(component: string, page?: Page): Promise<Component> {
    if (!isBlankBase({ component })) {
      return Promise.resolve(this.resolveComponent(component, page))
    }

    return Promise.resolve(
      page === undefined || this.resolveLoading === undefined
        ? undefined
        : this.resolveLoading(loadingBase(page) ?? page.url, page),
    )
  }

  protected resolveLayers(page: Page): Promise<ResolvedLayer[] | undefined> {
    if (!page.layers?.length) {
      return Promise.resolve(undefined)
    }

    return resolveLayers(page, (name, layerPage) => this.resolve(name, layerPage))
  }

  public nextOptimisticId(): number {
    return ++this.optimisticCounter
  }

  public markOptimisticConfirmed(id: number): void {
    this.confirmedOptimisticId = Math.max(this.confirmedOptimisticId, id)
  }

  public hasConfirmedOptimisticAfter(id: number): boolean {
    return this.confirmedOptimisticId > id
  }

  protected baselineOf(layerId?: string): Partial<Page['props']> {
    return this.optimisticBaselines.get(layerId) ?? {}
  }

  public setBaseline(key: string, value: unknown, layerId?: string): void {
    const baseline = this.baselineOf(layerId)

    if (!(key in baseline)) {
      this.optimisticBaselines.set(layerId, { ...baseline, [key]: value })
    }
  }

  public updateBaseline(key: string, value: unknown, layerId?: string): void {
    const baseline = this.baselineOf(layerId)

    if (key in baseline) {
      this.optimisticBaselines.set(layerId, { ...baseline, [key]: value })
    }
  }

  public hasBaseline(key: string, layerId?: string): boolean {
    return key in this.baselineOf(layerId)
  }

  public registerOptimistic(
    id: number,
    layerId: string | undefined,
    callback: (props: Page['props']) => Partial<Page['props']> | void,
  ): void {
    this.pendingOptimistics.push({ id, layerId, callback })
  }

  public unregisterOptimistic(id: number): void {
    this.pendingOptimistics = this.pendingOptimistics.filter((entry) => entry.id !== id)
  }

  public replayOptimistics(layerId?: string): Partial<Page['props']> {
    const tierProps = tierOf(this.page, layerId).props
    const baseline = this.baselineOf(layerId)
    const baselineKeys = Object.keys(baseline)

    if (baselineKeys.length === 0) {
      return {}
    }

    const props = cloneDeep(tierProps) as Record<string, unknown>

    for (const key of baselineKeys) {
      props[key] = cloneDeep(baseline[key])
    }

    for (const { callback, layerId: entryTier } of this.pendingOptimistics) {
      if (entryTier !== layerId) {
        continue
      }

      const result = callback(cloneDeep(props) as Page['props'])

      if (result) {
        Object.assign(props, result)
      }
    }

    const replayedProps: Partial<Page['props']> = {}

    for (const key of baselineKeys) {
      replayedProps[key] = props[key]
    }

    return replayedProps
  }

  public pendingOptimisticCount(): number {
    return this.pendingOptimistics.length
  }

  public clearOptimisticState(): void {
    this.optimisticBaselines.clear()
    this.pendingOptimistics = []
    this.confirmedOptimisticId = 0
  }

  public dropLayerOptimisticState(layerIds: string[]): void {
    for (const id of layerIds) {
      this.optimisticBaselines.delete(id)
    }

    this.pendingOptimistics = this.pendingOptimistics.filter(
      (entry) => !entry.layerId || !layerIds.includes(entry.layerId),
    )
  }

  public isTheSame(page: Page): boolean {
    return this.page.component === page.component
  }

  public on(event: PageEvent, callback: VoidFunction): VoidFunction {
    this.listeners.push({ event, callback })

    return () => {
      this.listeners = this.listeners.filter((listener) => listener.event !== event && listener.callback !== callback)
    }
  }

  public fireEventsFor(event: PageEvent): void {
    this.listeners.filter((listener) => listener.event === event).forEach((listener) => listener.callback())
  }
}

export const page = new CurrentPage()
