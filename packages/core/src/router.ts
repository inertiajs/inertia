import { cloneDeep, isEqual, omit } from 'es-toolkit'
import { get, set } from 'es-toolkit/compat'
import { progress, router } from '.'
import { config } from './config'
import { eventHandler } from './eventHandler'
import { fireBeforeEvent, fireClientVisitEvent, fireFlashEvent } from './events'
import { history } from './history'
import { InitialVisit } from './initialVisit'
import {
  LayerHandle,
  closeUnlandedLayer,
  composeLayer,
  composeLocalLayer,
  createLayerHandle,
  isLocalLayer,
  layerAt,
  layerClosing,
  layerHandleFor,
  layerPageOf,
  layersOf,
  nextLayerId,
  nextRenderKey,
  registryHas,
  registryWrite,
  tierOf,
  withTier,
} from './layers'
import { setPathPreservingIdentity, stripTopLevelUndefined } from './objectUtils'
import { page as currentPage } from './page'
import { polls } from './polls'
import { prefetchedRequests } from './prefetched'
import Queue from './queue'
import { Request } from './request'
import { RequestParams } from './requestParams'
import { RequestStream } from './requestStream'
import { Scroll } from './scroll'
import {
  ActiveVisit,
  BaseSnapshot,
  ClientSideVisitOptions,
  Component,
  ErrorBag,
  Errors,
  FlashData,
  GlobalEvent,
  GlobalEventNames,
  GlobalEventResult,
  InFlightPrefetch,
  InternalActiveVisit,
  Layer,
  LayerState,
  LocalLayer,
  Method,
  OptimisticCallback,
  Page,
  PageFlashData,
  PageProps,
  PendingVisit,
  PollOptions,
  PrefetchedResponse,
  PrefetchOptions,
  ReloadOptions,
  RequestPayload,
  RouterInitParams,
  UrlMethodPair,
  Visit,
  VisitCallbacks,
  VisitHelperOptions,
  VisitOptions,
} from './types'
import { uid } from './uid'
import {
  hrefToUrl,
  isSameUrlWithoutHash,
  isSameUrlWithoutQueryOrHash,
  isUrlMethodPair,
  transformUrlAndData,
} from './url'

const noop = () => {}

const syncRequests = new RequestStream({
  maxConcurrent: 1,
  interruptible: true,
})

const asyncRequests = new RequestStream({
  maxConcurrent: Infinity,
  interruptible: false,
})

const clientVisits = new Queue<Promise<void>>()

// What a client-side visit contributes to the page it writes, which is the visit minus its callbacks.
type ClientVisitPageParams<TProps> = Omit<
  ClientSideVisitOptions<TProps>,
  'viewTransition' | 'onError' | 'onFinish' | 'onFlash' | 'onSuccess' | 'layerId'
>

export class Router {
  protected syncRequestStream = syncRequests
  protected asyncRequestStream = asyncRequests
  protected clientVisitQueue = clientVisits

  protected pendingOptimisticCallback: OptimisticCallback | undefined = undefined

  // Bound to a layer, every request this router makes lands on it. The app's own is bound to none.
  constructor(protected layerId?: string) {}

  public init<ComponentType = Component>({
    initialPage,
    resolveComponent,
    resolveLoading,
    swapComponent,
    onFlash,
  }: RouterInitParams<ComponentType>): void {
    currentPage.init({
      initialPage,
      resolveComponent,
      resolveLoading,
      swapComponent,
      onFlash,
    })

    InitialVisit.handle()

    eventHandler.init()

    eventHandler.on('missingHistoryItem', () => {
      if (typeof window !== 'undefined') {
        this.visit(window.location.href, { preserveState: true, preserveScroll: true, replace: true })
      }
    })

    eventHandler.on('loadDeferredProps', (payload: { deferredProps: Page['deferredProps']; layerId?: string }) => {
      this.loadDeferredProps(payload.deferredProps, payload.layerId)
    })

    eventHandler.on('historyQuotaExceeded', (url) => {
      window.location.href = url
    })
  }

  public optimistic<TProps>(callback: OptimisticCallback<TProps>): this {
    this.pendingOptimisticCallback = callback as OptimisticCallback

    return this
  }

  public get<T extends RequestPayload = RequestPayload>(
    url: URL | string | UrlMethodPair,
    data: T = {} as T,
    options: VisitHelperOptions<T> = {},
  ): void {
    return this.visit(url, { ...options, method: 'get', data })
  }

  public post<T extends RequestPayload = RequestPayload>(
    url: URL | string | UrlMethodPair,
    data: T = {} as T,
    options: VisitHelperOptions<T> = {},
  ): void {
    return this.visit(url, { preserveState: true, ...options, method: 'post', data })
  }

  public put<T extends RequestPayload = RequestPayload>(
    url: URL | string | UrlMethodPair,
    data: T = {} as T,
    options: VisitHelperOptions<T> = {},
  ): void {
    return this.visit(url, { preserveState: true, ...options, method: 'put', data })
  }

  public patch<T extends RequestPayload = RequestPayload>(
    url: URL | string | UrlMethodPair,
    data: T = {} as T,
    options: VisitHelperOptions<T> = {},
  ): void {
    return this.visit(url, { preserveState: true, ...options, method: 'patch', data })
  }

  public delete<T extends RequestPayload = RequestPayload>(
    url: URL | string | UrlMethodPair,
    options: Omit<VisitOptions<T>, 'method'> = {},
  ): void {
    return this.visit(url, { preserveState: true, ...options, method: 'delete' })
  }

  public reload<T extends RequestPayload = RequestPayload>(options: ReloadOptions<T> = {}): void {
    return this.doReload(options)
  }

  protected doReload<T extends RequestPayload = RequestPayload>(
    options: ReloadOptions<T> & {
      deferredProps?: boolean
      poll?: boolean
    } = {},
  ): void {
    if (typeof window === 'undefined') {
      return
    }

    const page = currentPage.get()
    const { layerId = this.layerId, ...reloadOptions } = options
    const layer = layerAt(page, layerId)

    const url = layer?.url ?? ((page.layers?.length ?? 0) > 0 ? page.url : window.location.href)

    const visitOptions: VisitOptions<T> & { reload: true } = {
      ...reloadOptions,
      ...(layer?.url ? { layerId } : {}),
      reload: true,
      preserveScroll: true,
      preserveState: true,
      async: true,
      headers: {
        ...(options.headers || {}),
        'Cache-Control': 'no-cache',
      },
    }

    this.dispatchVisit(url, visitOptions)
  }

  public layer<T extends RequestPayload = RequestPayload>(
    url: string | URL | UrlMethodPair,
    options?: VisitOptions<T>,
  ): LayerHandle
  public layer(local: LocalLayer): LayerHandle
  public layer<T extends RequestPayload = RequestPayload>(
    target: string | URL | UrlMethodPair | LocalLayer,
    options: VisitOptions<T> = {},
  ): LayerHandle {
    if (isLocalLayer(target)) {
      return this.openLayer((id, owner) =>
        this.clientVisitQueue.add(() => this.performLocalOpen(id, owner, target.component, target.props ?? {})),
      )
    }

    return this.openLayer((id, owner) => this.visit(target, { ...options, layerId: id, layerOwner: owner }))
  }

  protected openLayer(open: (id: string, owner: string) => void): LayerHandle {
    const id = nextLayerId(currentPage.get())
    const handle = this.createLayerHandleWithOwner(id)

    registryWrite(id, handle)

    open(id, this.layerId ?? layersOf(currentPage.get()).at(-1)?.id ?? currentPage.id())

    if (!registryHas(id)) {
      // Refused before the caller had the handle to subscribe on, so its onClose is owed a turn.
      queueMicrotask(() => handle.fireOnClose())
    }

    return handle
  }

  public layerHandle(id?: string): LayerHandle {
    return layerHandleFor(id ?? currentPage.id(), (handleId) => this.createLayerHandleWithOwner(handleId))
  }

  protected createLayerHandleWithOwner(id: string): LayerHandle {
    return createLayerHandle(
      id,
      (handleId) => this.closeLayer(handleId),
      (layerId) => layerAt(currentPage.get(), layerId)?.owner,
    )
  }

  protected async performLocalOpen(id: string, owner: string, component: string, props: PageProps): Promise<void> {
    await layerClosing.unwindSettled()

    await currentPage.set(composeLocalLayer(currentPage.get(), component, props, id, owner), {
      preserveScroll: true,
      preserveState: true,
      preservesBase: true,
      viewTransition: false,
    })
  }

  public remember(data: unknown, key = 'default', layerId?: string): void {
    history.remember(data, key, layerId)
  }

  public restore<T = unknown>(key = 'default', layerId?: string): T | undefined {
    return history.restore(key, layerId) as T | undefined
  }

  public on<TEventName extends GlobalEventNames>(
    type: TEventName,
    callback: (event: GlobalEvent<TEventName>) => GlobalEventResult<TEventName>,
  ): VoidFunction {
    return this.onGlobal(type, callback)
  }

  public once<TEventName extends GlobalEventNames>(
    type: TEventName,
    callback: (event: GlobalEvent<TEventName>) => GlobalEventResult<TEventName>,
  ): VoidFunction {
    const remove = this.onGlobal(type, (event) => {
      remove()
      return callback(event)
    })

    return remove
  }

  // A `LayerApi` is this router with its own `on()` for the layer's events put on the instance, so
  // the router's own callers come through here to reach Inertia's.
  protected onGlobal<TEventName extends GlobalEventNames>(
    type: TEventName,
    callback: (event: GlobalEvent<TEventName>) => GlobalEventResult<TEventName>,
  ): VoidFunction {
    if (typeof window === 'undefined') {
      return () => {}
    }

    return eventHandler.onGlobalEvent(type, callback)
  }

  public hasPendingOptimistic(): boolean {
    return this.asyncRequestStream.hasPendingOptimistic()
  }

  public get activePolls(): number {
    return polls.count
  }

  public cancelAll({ async = true, prefetch = true, sync = true } = {}): void {
    if (async) {
      this.asyncRequestStream.cancelInFlight({ prefetch })
    }

    if (sync) {
      this.syncRequestStream.cancelInFlight()
    }
  }

  public poll(interval: number, requestOptions: ReloadOptions | (() => ReloadOptions) = {}, options: PollOptions = {}) {
    return polls.add(
      interval,
      ({ onStart, onFinish }) => {
        const resolved = typeof requestOptions === 'function' ? requestOptions() : requestOptions

        this.doReload({
          poll: true,
          preserveErrors: true,
          ...resolved,
          onCancelToken: (token) => {
            onStart(token.cancel)
            resolved.onCancelToken?.(token)
          },
          onFinish: (visit) => {
            onFinish()
            resolved.onFinish?.(visit)
          },
        })
      },
      {
        autoStart: options.autoStart ?? true,
        keepAlive: options.keepAlive ?? false,
        mode: options.mode,
      },
    )
  }

  public visit<T extends RequestPayload = RequestPayload>(
    href: string | URL | UrlMethodPair,
    options: VisitOptions<T> = {},
  ): void {
    this.dispatchVisit(href, { ...options, layerId: options.layerId ?? this.layerId })
  }

  // `visit` with the tier already decided: a reload that dropped its layer keeps it dropped.
  protected dispatchVisit<T extends RequestPayload = RequestPayload>(
    href: string | URL | UrlMethodPair,
    options: VisitOptions<T> = {},
  ): boolean {
    options.optimistic = options.optimistic ?? this.pendingOptimisticCallback
    this.pendingOptimisticCallback = undefined

    if (options.optimistic) {
      options.async = options.async ?? true
    }

    const visit: PendingVisit = this.getPendingVisit(href, {
      ...options,
      showProgress: options.showProgress ?? (!options.async || !!options.optimistic),
    } as VisitOptions)

    const events = this.getVisitEvents(options as VisitOptions)

    // If either of these return false, we don't want to continue
    if (events.onBefore(visit) === false || !fireBeforeEvent(visit)) {
      closeUnlandedLayer(currentPage.get(), visit.layerId)

      return false
    }

    const capturedBase = this.captureBase()

    this.cancelStaleRequests(visit)

    // Interrupt in-flight requests before taking the optimistic snapshot
    // so that any previous optimistic state is restored first
    if (!visit.async) {
      this.syncRequestStream.interruptInFlight()
    }

    if (options.optimistic) {
      this.applyOptimisticUpdate(options.optimistic, events, visit.layerId)
    }

    if (!currentPage.isCleared() && !visit.preserveUrl) {
      // Save scroll regions for the current page
      Scroll.save()
    }

    const requestParams: InternalActiveVisit = {
      ...visit,
      ...events,
    }

    const sendRequest = () => this.sendVisitRequest(requestParams, capturedBase, !!options.optimistic)

    if (this.instantComponent(visit)) {
      this.swapInstantlyThenSend(visit, requestParams, sendRequest)
    } else {
      sendRequest()
    }

    return true
  }

  // Cancel in-flight requests aimed at the page we're navigating away from (deferred props, partial
  // reloads, plain reloads), but leave prefetches, optimistic requests, and background async visits
  // to other pages untouched.
  protected cancelStaleRequests(visit: PendingVisit): void {
    const isPartialReload = visit.only.length > 0 || visit.except.length > 0 || visit.reset.length > 0

    const targetedLayer = layerAt(currentPage.get(), visit.layerId)
    const tierUrl = targetedLayer?.url ? hrefToUrl(targetedLayer.url) : hrefToUrl(currentPage.get().url)

    // For partial reloads, only compare the base URL (origin + pathname) to allow
    // concurrent requests with different query params to the same page
    const isSamePage = isPartialReload
      ? isSameUrlWithoutQueryOrHash(visit.url, tierUrl)
      : isSameUrlWithoutHash(visit.url, tierUrl)

    if (isSamePage) {
      return
    }

    this.asyncRequestStream.cancelInFlight(
      (request) =>
        !request.isPrefetch() &&
        !request.isOptimistic() &&
        (request.layerId ?? null) === (visit.layerId ?? null) &&
        isSameUrlWithoutQueryOrHash(request.getUrl(), tierUrl),
    )
  }

  protected sendVisitRequest(
    requestParams: InternalActiveVisit,
    capturedBase: BaseSnapshot,
    optimistic: boolean,
  ): void {
    const prefetched = prefetchedRequests.get(requestParams)

    if (prefetched) {
      progress.reveal(prefetched.inFlight)
      prefetchedRequests.use(prefetched, requestParams, capturedBase)

      return
    }

    progress.reveal(true)

    const requestStream = requestParams.async ? this.asyncRequestStream : this.syncRequestStream

    requestStream.send(Request.create(requestParams, currentPage.get(), capturedBase, { optimistic }))
  }

  // The component an instant visit fabricates its page from, if it named one it can use. An array is
  // what a lazily-imported component resolves to, and nothing here can say which of them was meant.
  protected instantComponent(visit: PendingVisit): string | null {
    if (!Array.isArray(visit.component)) {
      return visit.component
    }

    console.error(
      `The "component" prop received an array of components (${visit.component.join(', ')}), but only a single component string is supported for instant visits. Pass an explicit component name instead.`,
    )

    return null
  }

  // The fabricated page goes up first, and the request that replaces it must not scroll, remount, or
  // push an entry of its own: the swap it is landing on top of already did all three.
  protected swapInstantlyThenSend(
    visit: PendingVisit,
    requestParams: InternalActiveVisit,
    send: () => void,
  ): void {
    Promise.all([history.processQueue(), layerClosing.unwindSettled()]).then(() => {
      this.performInstantSwap(visit).then((fabricatedLayer) => {
        requestParams.preserveScroll = true
        requestParams.preserveState = true
        requestParams.replace = true
        requestParams.viewTransition = false
        requestParams.fabricatedLayer = fabricatedLayer
        send()
      })
    })
  }

  public getCached(
    href: string | URL | UrlMethodPair,
    options: VisitOptions = {},
  ): InFlightPrefetch | PrefetchedResponse | null {
    return prefetchedRequests.findCached(this.getPrefetchParams(href, options))
  }

  public flush(href: string | URL | UrlMethodPair, options: VisitOptions = {}): void {
    prefetchedRequests.remove(this.getPrefetchParams(href, options))
  }

  public flushAll(): void {
    prefetchedRequests.removeAll()
  }

  public flushByCacheTags(tags: string | string[]): void {
    prefetchedRequests.removeByTags(Array.isArray(tags) ? tags : [tags])
  }

  public getPrefetching(
    href: string | URL | UrlMethodPair,
    options: VisitOptions = {},
  ): InFlightPrefetch | PrefetchedResponse | null {
    return prefetchedRequests.findInFlight(this.getPrefetchParams(href, options))
  }

  public prefetch(
    href: string | URL | UrlMethodPair,
    options: VisitOptions = {},
    prefetchOptions: Partial<PrefetchOptions> = {},
  ) {
    const method: Method = options.method ?? (isUrlMethodPair(href) ? href.method : 'get')

    if (method !== 'get') {
      throw new Error('Prefetch requests must use the GET method')
    }

    const visit: PendingVisit = this.getPendingVisit(href, {
      ...options,
      async: true,
      showProgress: false,
      prefetch: true,
      viewTransition: false,
    })

    const visitUrl = visit.url.origin + visit.url.pathname + visit.url.search
    const currentUrl = window.location.origin + window.location.pathname + window.location.search

    if (visitUrl === currentUrl) {
      // Don't prefetch the current page, you're already on it
      return
    }

    const events = this.getVisitEvents(options)

    // If either of these return false, we don't want to continue
    if (events.onBefore(visit) === false || !fireBeforeEvent(visit)) {
      return
    }

    progress.hide()

    this.asyncRequestStream.interruptInFlight()

    const requestParams: InternalActiveVisit = {
      ...visit,
      ...events,
    }

    const ensureCurrentPageIsSet = (): Promise<void> => {
      return new Promise((resolve) => {
        const checkIfPageIsDefined = () => {
          if (currentPage.get()) {
            resolve()
          } else {
            setTimeout(checkIfPageIsDefined, 50)
          }
        }

        checkIfPageIsDefined()
      })
    }

    ensureCurrentPageIsSet().then(() => {
      prefetchedRequests.add(
        requestParams,
        (params) => {
          this.asyncRequestStream.send(Request.create(params, currentPage.get(), this.captureBase()))
        },
        {
          cacheFor: config.get('prefetch.cacheFor'),
          cacheTags: [],
          ...prefetchOptions,
        },
      )
    })
  }

  public close(id?: string): Promise<void> {
    return this.closeLayer(id)
  }

  // A `LayerApi` puts its own no-argument `close()` on the instance, so the router's own callers
  // come through here to close the layer they name rather than the one the api is bound to.
  protected closeLayer(id?: string): Promise<void> {
    return layerClosing.close(id, {
      programmatic: true,
      refresh: (address, layerId) => this.refreshBeneath(address, layerId),
    })
  }

  public closed(id?: string): Promise<void> {
    return layerClosing.closed(id)
  }

  protected refreshBeneath(address: string, layerId?: string): Promise<void> {
    return new Promise<void>((resolve) => {
      const reload: VisitOptions & { reload: true } = {
        reload: true,
        layerId,
        preserveState: true,
        preserveScroll: true,
        replace: true,
        // A follow-up, not a navigation: sent sync it would interrupt the work that closed the layer.
        async: true,
        // Every terminal path resolves. Success alone strands the close behind a cancelled refresh.
        onFinish: () => resolve(),
      }

      if (!this.dispatchVisit(address, reload)) {
        resolve()
      }
    })
  }

  public clearHistory(): void {
    history.clear()
  }

  public decryptHistory(): Promise<Page> {
    return history.decrypt()
  }

  public resolveComponent(component: string, page?: Page): Promise<Component | undefined> {
    return currentPage.resolve(component, page)
  }

  public replace<TProps = Page['props']>(params: ClientSideVisitOptions<TProps>): void {
    this.clientVisit(params, { replace: true })
  }

  public replaceProp<TProps = Page['props']>(
    name: string,
    value: unknown | ((oldValue: unknown, props: TProps) => unknown),
    options?: Pick<ClientSideVisitOptions, 'onError' | 'onFinish' | 'onSuccess' | 'layerId'>,
  ): void {
    this.replace({
      preserveScroll: true,
      preserveState: true,
      props(currentProps) {
        const newValue = typeof value === 'function' ? value(get(currentProps, name), currentProps) : value

        return setPathPreservingIdentity(currentProps, name, newValue)
      },
      ...(options || {}),
    })
  }

  public appendToProp<TProps = Page['props']>(
    name: string,
    value: unknown | unknown[] | ((oldValue: unknown, props: TProps) => unknown | unknown[]),
    options?: Pick<ClientSideVisitOptions, 'onError' | 'onFinish' | 'onSuccess' | 'layerId'>,
  ): void {
    this.replaceProp(
      name,
      (currentValue: unknown, currentProps: TProps) => {
        const newValue = typeof value === 'function' ? value(currentValue, currentProps) : value

        if (!Array.isArray(currentValue)) {
          currentValue = currentValue !== undefined ? [currentValue] : []
        }

        return [...(currentValue as unknown[]), newValue]
      },
      options,
    )
  }

  public prependToProp<TProps = Page['props']>(
    name: string,
    value: unknown | unknown[] | ((oldValue: unknown, props: TProps) => unknown | unknown[]),
    options?: Pick<ClientSideVisitOptions, 'onError' | 'onFinish' | 'onSuccess' | 'layerId'>,
  ): void {
    this.replaceProp(
      name,
      (currentValue: unknown, currentProps: TProps) => {
        const newValue = typeof value === 'function' ? value(currentValue, currentProps) : value

        if (!Array.isArray(currentValue)) {
          currentValue = currentValue !== undefined ? [currentValue] : []
        }

        return [newValue, ...(currentValue as unknown[])]
      },
      options,
    )
  }

  public push<TProps = Page['props']>(params: ClientSideVisitOptions<TProps>): void {
    this.clientVisit(params)
  }

  public flash<TFlash extends PageFlashData = PageFlashData>(
    keyOrData: string | ((flash: FlashData) => TFlash) | TFlash,
    value?: unknown,
    { layerId = this.layerId }: { layerId?: string } = {},
  ): void {
    const page = currentPage.get()
    const current = tierOf(page, layerId).flash
    let flash: PageFlashData

    if (typeof keyOrData === 'function') {
      flash = keyOrData(current)
    } else if (typeof keyOrData === 'string') {
      flash = { ...current, [keyOrData]: value }
    } else if (keyOrData && Object.keys(keyOrData).length) {
      flash = { ...current, ...keyOrData }
    } else {
      return
    }

    currentPage.setFlash(flash, layerAt(page, layerId)?.id)

    if (Object.keys(flash).length) {
      fireFlashEvent(flash)
    }
  }

  protected clientVisit<TProps = Page['props']>(
    params: ClientSideVisitOptions<TProps>,
    { replace = false }: { replace?: boolean } = {},
  ): void {
    const visit = { ...params, layerId: params.layerId ?? this.layerId }

    this.clientVisitQueue.add(() => this.performClientVisit(visit, { replace }))
  }

  protected async performClientVisit<TProps = Page['props']>(
    params: ClientSideVisitOptions<TProps>,
    { replace = false }: { replace?: boolean } = {},
  ): Promise<void> {
    await layerClosing.unwindSettled()

    const current = currentPage.get()

    const targetedLayer = layerAt(current, params.layerId)
    const tier = tierOf(current, params.layerId)

    const { props, flash } = this.clientVisitState(params, tier)
    const { viewTransition, onFinish } = params
    const pageParams = omit(params, ['viewTransition', 'onError', 'onFinish', 'onFlash', 'onSuccess', 'layerId'])

    const { page, preservesBase } = this.clientVisitPage(current, targetedLayer, {
      pageParams,
      props: props as Page['props'],
      flash: flash ?? {},
      preserveState: params.preserveState ?? false,
      replace,
    })

    const tierPage = targetedLayer ? layerPageOf(current, targetedLayer) : page

    // A write that lands on a layer leaves the page beneath it standing, so its scroll stands too.
    const preserveScroll =
      !!targetedLayer || RequestParams.resolvePreserveOption(params.preserveScroll ?? false, tierPage)
    const preserveState = RequestParams.resolvePreserveOption(params.preserveState ?? false, tierPage)

    const visitId = this.createVisitId()

    return currentPage
      .set(page, {
        replace,
        preserveScroll,
        preserveState,
        preservesBase,
        viewTransition,
        visitId,
      })
      .then(() => this.announceClientVisit(params, { replace, visitId }))
      .finally(() => onFinish?.(params))
  }

  // The props and flash the write installs: either given outright, or built from what the tier holds.
  protected clientVisitState<TProps>(
    params: ClientSideVisitOptions<TProps>,
    tier: Layer,
  ): { props: PageProps | TProps; flash: FlashData | undefined } {
    const flash = typeof params.flash === 'function' ? params.flash(tier.flash) : params.flash

    if (typeof params.props !== 'function') {
      return { props: params.props ?? tier.props, flash }
    }

    // The callback is handed the tier's once props alongside its own, so it can build on values it
    // is not being sent again.
    const onceProps = Object.fromEntries(
      Object.values(tier.onceProps ?? {}).map((onceProp) => [onceProp.prop, get(tier.props, onceProp.prop)]),
    )

    return { props: params.props(tier.props as TProps, onceProps as Partial<TProps>), flash }
  }

  // A write aimed at a layer rewrites that layer and leaves the page beneath it standing. One aimed
  // at the page replaces it, and takes the stack with it unless it is only rewriting what is there.
  protected clientVisitPage<TProps>(
    current: Page,
    targetedLayer: LayerState | undefined,
    {
      pageParams,
      props,
      flash,
      preserveState,
      replace,
    }: {
      pageParams: ClientVisitPageParams<TProps>
      props: Page['props']
      flash: FlashData
      preserveState: Visit['preserveState']
      replace: boolean
    },
  ): { page: Page; preservesBase: boolean } {
    if (targetedLayer) {
      // Resolved against the layer's own page, so `preserveState: 'errors'` reads the layer's bag.
      const keepsState = RequestParams.resolvePreserveOption(preserveState, layerPageOf(current, targetedLayer))

      return {
        page: withTier(current, targetedLayer.id, {
          ...(pageParams.component !== undefined && { component: pageParams.component }),
          ...(pageParams.url !== undefined && { url: pageParams.url }),
          ...(pageParams.encryptHistory !== undefined && { encryptHistory: pageParams.encryptHistory }),
          ...(keepsState ? {} : { renderKey: nextRenderKey() }),
          flash,
          props,
        }),
        preservesBase: true,
      }
    }

    const preservesBase = replace && pageParams.component === undefined

    return {
      page: { ...(preservesBase ? current : omit(current, ['layers'])), ...pageParams, flash, props },
      preservesBase,
    }
  }

  // What the write landed on, told to whoever asked: its flash, then its errors or its success.
  protected announceClientVisit<TProps>(
    params: ClientSideVisitOptions<TProps>,
    { replace, visitId }: { replace: boolean; visitId: string },
  ): void {
    fireClientVisitEvent(currentPage.get(), { replace, visitId })

    const current = currentPage.get()
    const tier = tierOf(current, params.layerId)
    const currentFlash = tier.flash

    if (Object.keys(currentFlash).length > 0) {
      fireFlashEvent(currentFlash)
      params.onFlash?.(currentFlash)
    }

    const errors = (tier.props.errors || {}) as Errors & ErrorBag

    if (Object.keys(errors).length === 0) {
      params.onSuccess?.(currentPage.get())

      return
    }

    params.onError?.(params.errorBag ? errors[params.errorBag || ''] || {} : errors)
  }

  protected captureBase(): BaseSnapshot {
    return { page: currentPage.get(), generation: currentPage.generation() }
  }

  protected performInstantSwap(visit: PendingVisit): Promise<boolean> {
    const current = currentPage.get()
    const targetedLayer = layerAt(current, visit.layerId)
    const tier = targetedLayer ?? current

    const sharedProps = Object.fromEntries(
      (current.sharedProps ?? []).filter((key) => key in tier.props).map((key) => [key, tier.props[key]]),
    )

    const resolvedPageProps =
      typeof visit.pageProps === 'function'
        ? visit.pageProps(cloneDeep(tier.props), cloneDeep(sharedProps))
        : visit.pageProps

    const intermediateProps = resolvedPageProps !== null ? { ...resolvedPageProps } : { ...sharedProps }
    const props = { ...intermediateProps, errors: {} }
    const url = visit.url.pathname + visit.url.search + visit.url.hash

    if (targetedLayer) {
      return this.swapLayerInstantly(current, targetedLayer, visit, props, url).then(() => true)
    }

    if (visit.layerOwner !== undefined) {
      return this.openLayerInstantly(current, visit, props, url).then(() => true)
    }

    const onceProps = this.preserveOncePropsOnInstantVisit(current, props)

    const intermediatePage: Page = {
      component: visit.component!,
      url,
      version: current.version,
      props,
      flash: {},
      rescuedProps: [],
      clearHistory: false,
      encryptHistory: current.encryptHistory,
      sharedProps: current.sharedProps,
      onceProps,
      rememberedState: {},
    }

    return currentPage
      .set(intermediatePage, {
        replace: visit.replace,
        preserveScroll: RequestParams.resolvePreserveOption(visit.preserveScroll, intermediatePage),
        preserveState: false,
        viewTransition: visit.viewTransition,
        visitId: visit.id,
      })
      .then(() => false)
  }

  // The same fabrication aimed at one layer, so a link inside a layer renders instantly there
  // instead of tearing the stack down to put the placeholder on the page.
  protected swapLayerInstantly(
    current: Page,
    layer: LayerState,
    visit: PendingVisit,
    props: Page['props'],
    url: string,
  ): Promise<void> {
    const page = withTier(current, layer.id, {
      component: visit.component!,
      url,
      renderKey: nextRenderKey(),
      props,
      flash: {},
      rescuedProps: [],
      deferredProps: {},
      initialDeferredProps: undefined,
      onceProps: this.preserveOncePropsOnInstantVisit(layer, props),
      scrollProps: {},
    })

    return currentPage.set(page, {
      replace: visit.replace,
      // The page beneath is staying, so its scroll is not the fabrication's to reset.
      preserveScroll: true,
      // The base beneath keeps its component and its id, so what lands next still composes onto it.
      preserveState: true,
      preservesBase: true,
      viewTransition: visit.viewTransition,
      visitId: visit.id,
    })
  }

  // A visit that is opening a layer puts its placeholder up as a layer, leaving the page it opens
  // on where it is. Keyed by the id the open created, which the response then claims it under.
  protected openLayerInstantly(current: Page, visit: PendingVisit, props: Page['props'], url: string): Promise<void> {
    const placeholder = {
      component: visit.component!,
      props,
      url,
      layer: { key: visit.layerId },
      version: current.version,
    } as unknown as Page

    return currentPage.set(composeLayer(current, placeholder, visit.layerId!, { owner: visit.layerOwner! }), {
      replace: visit.replace,
      preserveScroll: true,
      preserveState: true,
      preservesBase: true,
      viewTransition: visit.viewTransition,
      visitId: visit.id,
    })
  }

  /**
   * Once props are remembered client-side, so the placeholder page must preserve their values
   * and registry. Otherwise the swap discards the value, and an in-flight prefetch that already
   * claimed the prop resolves with nothing to restore it from.
   */
  protected preserveOncePropsOnInstantVisit(current: Layer, props: PageProps): Page['onceProps'] {
    const onceProps: NonNullable<Page['onceProps']> = {}

    Object.entries(current.onceProps ?? {}).forEach(([key, onceProp]) => {
      if (get(props, onceProp.prop) !== undefined) {
        // The visit provided its own value, so we can't claim to remember the once prop
        return
      }

      const currentValue = get(current.props, onceProp.prop)

      if (currentValue === undefined) {
        return
      }

      set(props, onceProp.prop, currentValue)

      onceProps[key] = onceProp
    })

    return onceProps
  }

  protected getPrefetchParams(href: string | URL | UrlMethodPair, options: VisitOptions): ActiveVisit {
    return {
      ...this.getPendingVisit(href, {
        ...options,
        async: true,
        showProgress: false,
        prefetch: true,
        viewTransition: false,
      }),
      ...this.getVisitEvents(options),
    }
  }

  protected createVisitId(): string {
    return uid()
  }

  protected getPendingVisit(href: string | URL | UrlMethodPair, options: VisitOptions): PendingVisit {
    if (isUrlMethodPair(href)) {
      const urlMethodPair = href
      href = urlMethodPair.url
      options.method = options.method ?? urlMethodPair.method
    }

    const defaultVisitOptionsCallback = config.get('visitOptions')

    const configuredOptions = defaultVisitOptionsCallback
      ? defaultVisitOptionsCallback(href.toString(), cloneDeep(options)) || {}
      : {}

    const mergedOptions: Visit = {
      method: 'get',
      data: {},
      replace: false,
      preserveScroll: false,
      preserveState: false,
      only: [],
      except: [],
      headers: {},
      errorBag: '',
      forceFormData: false,
      queryStringArrayFormat: 'brackets',
      async: false,
      showProgress: true,
      fresh: false,
      reset: [],
      preserveUrl: false,
      preserveErrors: false,
      prefetch: false,
      invalidateCacheTags: [],
      viewTransition: false,
      component: null,
      pageProps: null,
      cached: false,
      ...stripTopLevelUndefined(options),
      ...stripTopLevelUndefined(configuredOptions),
    }

    const [url, _data] = transformUrlAndData(
      href,
      mergedOptions.data,
      mergedOptions.method,
      mergedOptions.forceFormData,
      mergedOptions.queryStringArrayFormat,
    )

    const visit = {
      id: this.createVisitId(),
      cancelled: false,
      completed: false,
      interrupted: false,
      ...mergedOptions,
      url,
      data: _data,
    }

    if (visit.prefetch) {
      visit.headers['Purpose'] = 'prefetch'
    }

    return visit
  }

  protected getVisitEvents(options: VisitOptions): VisitCallbacks {
    return {
      onCancelToken: options.onCancelToken || noop,
      onBefore: options.onBefore || noop,
      onBeforeUpdate: options.onBeforeUpdate || noop,
      onStart: options.onStart || noop,
      onProgress: options.onProgress || noop,
      onFinish: options.onFinish || noop,
      onCancel: options.onCancel || noop,
      onSuccess: options.onSuccess || noop,
      onError: options.onError || noop,
      onHttpException: options.onHttpException || noop,
      onNetworkError: options.onNetworkError || noop,
      onFlash: options.onFlash || noop,
      onPrefetched: options.onPrefetched || noop,
      onPrefetching: options.onPrefetching || noop,
    }
  }

  protected applyOptimisticUpdate(optimistic: OptimisticCallback, events: VisitCallbacks, layerId?: string): void {
    const layer = layerAt(currentPage.get(), layerId)

    if (layerId && !layer) {
      return
    }

    const tierPage = layer ? layerPageOf(currentPage.get(), layer) : currentPage.get()
    const currentProps = tierPage.props
    const optimisticProps = optimistic(cloneDeep(currentProps))

    if (!optimisticProps) {
      return
    }

    const changedKeys: string[] = []

    for (const key of Object.keys(optimisticProps)) {
      if (!isEqual(currentProps[key], optimisticProps[key])) {
        changedKeys.push(key)
      }
    }

    if (changedKeys.length === 0) {
      return
    }

    const id = currentPage.nextOptimisticId()
    const component = tierPage.component

    for (const key of changedKeys) {
      currentPage.setBaseline(key, cloneDeep(currentProps[key]), layerId)
    }

    currentPage.registerOptimistic(id, layerId, optimistic)

    currentPage.setPropsQuietly({ ...currentProps, ...optimisticProps }, layerId)

    let shouldRestore = true

    const originalOnSuccess = events.onSuccess
    events.onSuccess = (page) => {
      shouldRestore = false
      return originalOnSuccess(page)
    }

    const originalOnFinish = events.onFinish
    events.onFinish = (visit) => {
      currentPage.unregisterOptimistic(id)

      const tier = layerId ? layerAt(currentPage.get(), layerId) : currentPage.get()

      if (shouldRestore && tier?.component === component) {
        const replayedProps = currentPage.replayOptimistics(layerId)

        if (Object.keys(replayedProps).length > 0) {
          currentPage.setPropsQuietly({ ...tier.props, ...replayedProps } as Page['props'], layerId)
        }
      }

      if (currentPage.pendingOptimisticCount() === 0) {
        currentPage.clearOptimisticState()
      }

      return originalOnFinish(visit)
    }
  }

  protected loadDeferredProps(deferred: Page['deferredProps'], layerId?: string): void {
    if (deferred) {
      Object.values(deferred).forEach((props) => {
        this.doReload({
          only: props,
          deferredProps: true,
          preserveErrors: true,
          ...(layerId && { layerId }),
        })
      })
    }
  }
}

// A layer from the inside: the router bound to it, plus the layer's own handle. `layer.post()` is
// `router.post()` aimed at the layer, and `layer.layer()` opens a child this layer owns.
export interface LayerApi extends Pick<
  Router,
  | 'visit'
  | 'get'
  | 'post'
  | 'put'
  | 'patch'
  | 'delete'
  | 'reload'
  | 'poll'
  | 'layer'
  | 'push'
  | 'replace'
  | 'replaceProp'
  | 'appendToProp'
  | 'prependToProp'
  | 'flash'
> {
  id: string | undefined
  close(): Promise<void>
  onClose(callback: () => void): () => void
  emit(name: string, payload?: unknown): void
  on(name: string, callback: (payload?: unknown, childId?: string) => void): () => void
  once(name: string, callback: (payload?: unknown, childId?: string) => void): () => void
}

export const createLayerApi = (id: string | undefined): LayerApi =>
  Object.assign(new Router(id), {
    id,
    close: () => (id === undefined ? Promise.resolve() : router.layerHandle(id).close()),
    onClose: (callback: () => void) => router.layerHandle(id).onClose(callback),
    emit: (name: string, payload?: unknown) => router.layerHandle(id).emit(name, payload),
    on: (name: string, callback: (payload?: unknown, childId?: string) => void) =>
      router.layerHandle(id).on(name, callback),
    once: (name: string, callback: (payload?: unknown, childId?: string) => void) =>
      router.layerHandle(id).once(name, callback),
  })
