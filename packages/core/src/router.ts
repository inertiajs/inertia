import { cloneDeep, get, isEqual, set } from 'lodash-es'
import { progress } from '.'
import { config } from './config'
import { eventHandler } from './eventHandler'
import { fireBeforeEvent, fireFlashEvent } from './events'
import { history } from './history'
import { InitialVisit } from './initialVisit'
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
  ClientSideVisitOptions,
  Component,
  FlashData,
  GlobalEvent,
  GlobalEventNames,
  GlobalEventResult,
  InFlightPrefetch,
  Method,
  OptimisticCallback,
  Page,
  PageFlashData,
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
import {
  hrefToUrl,
  isSameUrlWithoutHash,
  isSameUrlWithoutQueryOrHash,
  isUrlMethodPair,
  transformUrlAndData,
} from './url'

export class Router {
  protected syncRequestStream = new RequestStream({
    maxConcurrent: 1,
    interruptible: true,
  })

  protected asyncRequestStream = new RequestStream({
    maxConcurrent: Infinity,
    interruptible: false,
  })

  protected clientVisitQueue = new Queue<Promise<void>>()

  protected pendingOptimisticCallback: OptimisticCallback | null = null

  public init<ComponentType = Component>({
    initialPage,
    resolveComponent,
    swapComponent,
    onFlash,
  }: RouterInitParams<ComponentType>): void {
    currentPage.init({
      initialPage,
      resolveComponent,
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

    eventHandler.on('loadDeferredProps', (deferredProps: Page['deferredProps']) => {
      this.loadDeferredProps(deferredProps)
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
    } = {},
  ): void {
    if (typeof window === 'undefined') {
      return
    }

    return this.visit(window.location.href, {
      ...options,
      preserveScroll: true,
      preserveState: true,
      async: true,
      headers: {
        ...(options.headers || {}),
        'Cache-Control': 'no-cache',
      },
    })
  }

  public remember(data: unknown, key = 'default'): void {
    history.remember(data, key)
  }

  public restore<T = unknown>(key = 'default'): T | undefined {
    return history.restore(key) as T | undefined
  }

  public on<TEventName extends GlobalEventNames>(
    type: TEventName,
    callback: (event: GlobalEvent<TEventName>) => GlobalEventResult<TEventName>,
  ): VoidFunction {
    if (typeof window === 'undefined') {
      return () => {}
    }

    return eventHandler.onGlobalEvent(type, callback)
  }

  /**
   * @deprecated Use cancelAll() instead.
   */
  public cancel(): void {
    this.syncRequestStream.cancelInFlight()
  }

  public cancelAll({ async = true, prefetch = true, sync = true } = {}): void {
    if (async) {
      this.asyncRequestStream.cancelInFlight({ prefetch })
    }

    if (sync) {
      this.syncRequestStream.cancelInFlight()
    }
  }

  public poll(interval: number, requestOptions: ReloadOptions = {}, options: PollOptions = {}) {
    return polls.add(interval, () => this.reload(requestOptions), {
      autoStart: options.autoStart ?? true,
      keepAlive: options.keepAlive ?? false,
    })
  }

  public visit<T extends RequestPayload = RequestPayload>(
    href: string | URL | UrlMethodPair,
    options: VisitOptions<T> = {},
  ): void {
    const visit: PendingVisit = this.getPendingVisit(href, {
      ...options,
      showProgress: options.showProgress ?? !options.async,
    } as VisitOptions)

    const events = this.getVisitEvents(options as VisitOptions)

    // If either of these return false, we don't want to continue
    if (events.onBefore(visit) === false || !fireBeforeEvent(visit)) {
      return
    }

    const currentPageUrl = hrefToUrl(currentPage.get().url)
    const isPartialReload = visit.only.length > 0 || visit.except.length > 0 || visit.reset.length > 0

    // For partial reloads, only compare the base URL (origin + pathname) to allow
    // concurrent requests with different query params to the same page
    const isSamePage = isPartialReload
      ? isSameUrlWithoutQueryOrHash(visit.url, currentPageUrl)
      : isSameUrlWithoutHash(visit.url, currentPageUrl)

    if (!isSamePage) {
      // Only cancel non-prefetch requests (deferred props + partial reloads)
      this.asyncRequestStream.cancelInFlight({ prefetch: false })
    }

    // Interrupt in-flight requests before taking the optimistic snapshot
    // so that any previous optimistic state is restored first
    if (!visit.async) {
      this.syncRequestStream.interruptInFlight()
    }

    options.optimistic = options.optimistic ?? this.pendingOptimisticCallback ?? undefined
    this.pendingOptimisticCallback = null

    if (options.optimistic) {
      this.applyOptimisticUpdate(options.optimistic, events)
    }

    if (!currentPage.isCleared() && !visit.preserveUrl) {
      // Save scroll regions for the current page
      Scroll.save()
    }

    const requestParams: PendingVisit & VisitCallbacks = {
      ...visit,
      ...events,
    }

    const prefetched = prefetchedRequests.get(requestParams)

    if (prefetched) {
      progress.reveal(prefetched.inFlight)
      prefetchedRequests.use(prefetched, requestParams)
    } else {
      progress.reveal(true)
      const requestStream = visit.async ? this.asyncRequestStream : this.syncRequestStream
      requestStream.send(Request.create(requestParams, currentPage.get()))
    }
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

    const requestParams: PendingVisit & VisitCallbacks = {
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
          this.asyncRequestStream.send(Request.create(params, currentPage.get()))
        },
        {
          cacheFor: config.get('prefetch.cacheFor'),
          cacheTags: [],
          ...prefetchOptions,
        },
      )
    })
  }

  public clearHistory(): void {
    history.clear()
  }

  public decryptHistory(): Promise<Page> {
    return history.decrypt()
  }

  public resolveComponent(component: string, page?: Page): Promise<Component> {
    return currentPage.resolve(component, page)
  }

  public replace<TProps = Page['props']>(params: ClientSideVisitOptions<TProps>): void {
    this.clientVisit(params, { replace: true })
  }

  public replaceProp<TProps = Page['props']>(
    name: string,
    value: unknown | ((oldValue: unknown, props: TProps) => unknown),
    options?: Pick<ClientSideVisitOptions, 'onError' | 'onFinish' | 'onSuccess'>,
  ): void {
    this.replace({
      preserveScroll: true,
      preserveState: true,
      props(currentProps) {
        const newValue = typeof value === 'function' ? value(get(currentProps, name), currentProps) : value

        return set(cloneDeep(currentProps), name, newValue)
      },
      ...(options || {}),
    })
  }

  public appendToProp<TProps = Page['props']>(
    name: string,
    value: unknown | unknown[] | ((oldValue: unknown, props: TProps) => unknown | unknown[]),
    options?: Pick<ClientSideVisitOptions, 'onError' | 'onFinish' | 'onSuccess'>,
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
    options?: Pick<ClientSideVisitOptions, 'onError' | 'onFinish' | 'onSuccess'>,
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
  ): void {
    const current = currentPage.get().flash
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

    currentPage.setFlash(flash)

    if (Object.keys(flash).length) {
      fireFlashEvent(flash)
    }
  }

  protected clientVisit<TProps = Page['props']>(
    params: ClientSideVisitOptions<TProps>,
    { replace = false }: { replace?: boolean } = {},
  ): void {
    this.clientVisitQueue.add(() => this.performClientVisit(params, { replace }))
  }

  protected performClientVisit<TProps = Page['props']>(
    params: ClientSideVisitOptions<TProps>,
    { replace = false }: { replace?: boolean } = {},
  ): Promise<void> {
    const current = currentPage.get()

    const onceProps =
      typeof params.props === 'function'
        ? Object.fromEntries(
            Object.values(current.onceProps ?? {}).map((onceProp) => [onceProp.prop, current.props[onceProp.prop]]),
          )
        : {}

    const props =
      typeof params.props === 'function'
        ? params.props(current.props as TProps, onceProps as Partial<TProps>)
        : (params.props ?? current.props)

    const flash = typeof params.flash === 'function' ? params.flash(current.flash) : params.flash

    const { viewTransition, onError, onFinish, onFlash, onSuccess, ...pageParams } = params

    const page = {
      ...current,
      ...pageParams,
      flash: flash ?? {},
      props: props as Page['props'],
    }

    const preserveScroll = RequestParams.resolvePreserveOption(params.preserveScroll ?? false, page)
    const preserveState = RequestParams.resolvePreserveOption(params.preserveState ?? false, page)

    return currentPage
      .set(page, {
        replace,
        preserveScroll,
        preserveState,
        viewTransition,
      })
      .then(() => {
        const currentFlash = currentPage.get().flash

        if (Object.keys(currentFlash).length > 0) {
          fireFlashEvent(currentFlash)
          onFlash?.(currentFlash)
        }

        const errors = currentPage.get().props.errors || {}

        if (Object.keys(errors).length === 0) {
          onSuccess?.(currentPage.get())
          return
        }

        const scopedErrors = params.errorBag ? errors[params.errorBag || ''] || {} : errors

        onError?.(scopedErrors)
      })
      .finally(() => onFinish?.(params))
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
      prefetch: false,
      invalidateCacheTags: [],
      viewTransition: false,
      ...options,
      ...configuredOptions,
    }

    const [url, _data] = transformUrlAndData(
      href,
      mergedOptions.data,
      mergedOptions.method,
      mergedOptions.forceFormData,
      mergedOptions.queryStringArrayFormat,
    )

    const visit = {
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
      onCancelToken: options.onCancelToken || (() => {}),
      onBefore: options.onBefore || (() => {}),
      onBeforeUpdate: options.onBeforeUpdate || (() => {}),
      onStart: options.onStart || (() => {}),
      onProgress: options.onProgress || (() => {}),
      onFinish: options.onFinish || (() => {}),
      onCancel: options.onCancel || (() => {}),
      onSuccess: options.onSuccess || (() => {}),
      onError: options.onError || (() => {}),
      onFlash: options.onFlash || (() => {}),
      onPrefetched: options.onPrefetched || (() => {}),
      onPrefetching: options.onPrefetching || (() => {}),
    }
  }

  protected applyOptimisticUpdate(optimistic: OptimisticCallback, events: VisitCallbacks): void {
    const optimisticProps = optimistic(cloneDeep(currentPage.get().props))

    if (!optimisticProps) {
      return
    }

    const currentProps = cloneDeep(currentPage.get().props)
    const propsSnapshot: Partial<Page['props']> = {}

    for (const key of Object.keys(optimisticProps)) {
      if (!isEqual(currentProps[key], optimisticProps[key])) {
        propsSnapshot[key] = cloneDeep(currentProps[key])
      }
    }

    if (Object.keys(propsSnapshot).length === 0) {
      return
    }

    currentPage.setPropsQuietly({ ...currentProps, ...optimisticProps })

    let shouldRestore = true

    const originalOnSuccess = events.onSuccess
    events.onSuccess = (page) => {
      shouldRestore = false
      return originalOnSuccess(page)
    }

    const originalOnFinish = events.onFinish
    events.onFinish = (visit) => {
      if (shouldRestore) {
        currentPage.setPropsQuietly({ ...currentPage.get().props, ...propsSnapshot })
      }

      return originalOnFinish(visit)
    }
  }

  protected loadDeferredProps(deferred: Page['deferredProps']): void {
    if (deferred) {
      Object.entries(deferred).forEach(([_, group]) => {
        this.doReload({ only: group, deferredProps: true })
      })
    }
  }
}
