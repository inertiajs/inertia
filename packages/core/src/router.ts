import debounce from './debounce'
import { fireBeforeEvent, fireNavigateEvent } from './events'
import { hasFiles } from './files'
import { isFormData, objectToFormData } from './formData'
import { History } from './history'
import { navigationType } from './navigationType'
import { page as currentPage } from './page'
import { polls } from './polls'
import { Request } from './request'
import { RequestStream } from './requestStream'
import { Scroll } from './scroll'
import { SessionStorage } from './sessionStorage'
import {
  GlobalEvent,
  GlobalEventNames,
  GlobalEventResult,
  LocationVisit,
  Method,
  Page,
  PendingVisit,
  PollOptions,
  ReloadOptions,
  RequestPayload,
  RouterInitParams,
  VisitHelperOptions,
  VisitOptions,
} from './types'
import { hrefToUrl, mergeDataIntoQueryString } from './url'

export class Router {
  protected syncRequestStream = new RequestStream({
    maxConcurrent: 1,
    interruptible: true,
  })

  protected asyncRequestStream = new RequestStream({
    maxConcurrent: Infinity,
    interruptible: false,
  })

  public init({ initialPage, resolveComponent, swapComponent }: RouterInitParams): void {
    currentPage.init({
      initialPage,
      resolveComponent,
      swapComponent,
    })

    currentPage.on('firstLoad', () => {
      this.loadDeferredProps()
    })

    currentPage.on('newComponent', () => {
      polls.clear()
      this.loadDeferredProps()
    })

    this.clearRememberedStateOnReload()
    this.initializeVisit()
    this.setupEventListeners()
  }

  public get(url: URL | string, data: RequestPayload = {}, options: VisitHelperOptions = {}): void {
    return this.visit(url, { ...options, method: 'get', data })
  }

  public post(url: URL | string, data: RequestPayload = {}, options: VisitHelperOptions = {}): void {
    return this.visit(url, { preserveState: true, ...options, method: 'post', data })
  }

  public put(url: URL | string, data: RequestPayload = {}, options: VisitHelperOptions = {}): void {
    return this.visit(url, { preserveState: true, ...options, method: 'put', data })
  }

  public patch(url: URL | string, data: RequestPayload = {}, options: VisitHelperOptions = {}): void {
    return this.visit(url, { preserveState: true, ...options, method: 'patch', data })
  }

  public delete(url: URL | string, options: Omit<VisitOptions, 'method'> = {}): void {
    return this.visit(url, { preserveState: true, ...options, method: 'delete' })
  }

  public reload(options: ReloadOptions = {}): void {
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
    History.remember(data, key)
  }

  public restore(key = 'default'): unknown {
    return History.restore(key)
  }

  public on<TEventName extends GlobalEventNames>(
    type: TEventName,
    callback: (event: GlobalEvent<TEventName>) => GlobalEventResult<TEventName>,
  ): VoidFunction {
    const listener = ((event: GlobalEvent<TEventName>) => {
      const response = callback(event)

      if (event.cancelable && !event.defaultPrevented && response === false) {
        event.preventDefault()
      }
    }) as EventListener

    return this.registerListener(`inertia:${type}`, listener)
  }

  public cancel(): void {
    this.syncRequestStream.cancelInFlight()
  }

  public cancelAll(): void {
    this.asyncRequestStream.cancelInFlight()
    this.syncRequestStream.cancelInFlight()
  }

  public poll(interval: number, requestOptions: ReloadOptions = {}, options: PollOptions = {}) {
    return polls.add(interval, () => this.reload(requestOptions), { keepAlive: options.keepAlive || false })
  }

  public visit(
    href: string | URL,
    {
      method = 'get',
      data = {},
      replace = false,
      preserveScroll = false,
      preserveState = false,
      only = [],
      except = [],
      headers = {},
      errorBag = '',
      forceFormData = false,
      onCancelToken = () => {},
      onBefore = () => {},
      onStart = () => {},
      onProgress = () => {},
      onFinish = () => {},
      onCancel = () => {},
      onSuccess = () => {},
      onError = () => {},
      queryStringArrayFormat = 'brackets',
      async = false,
    }: VisitOptions = {},
  ): void {
    const [url, _data] = this.transformUrlAndData(href, data, method, forceFormData, queryStringArrayFormat)

    const visit: PendingVisit = {
      url,
      method,
      data: _data,
      replace,
      preserveScroll,
      preserveState,
      only,
      except,
      headers,
      errorBag,
      forceFormData,
      queryStringArrayFormat,
      cancelled: false,
      completed: false,
      interrupted: false,
      async,
    }

    // If either of these return false, we don't want to continue
    if (onBefore(visit) === false || !fireBeforeEvent(visit)) {
      return
    }

    const requestStream = async ? this.asyncRequestStream : this.syncRequestStream

    requestStream.interruptInFlight()

    // Save scroll regions for the current page
    Scroll.save(currentPage.get())

    const request = Request.create(
      {
        ...visit,
        onCancelToken,
        onBefore,
        onStart,
        onProgress,
        onFinish,
        onCancel,
        onSuccess,
        onError,
        queryStringArrayFormat,
      },
      currentPage.get(),
    )

    requestStream.send(request)
  }

  public replace(url: URL | string, options: Omit<VisitOptions, 'replace'> = {}): void {
    console.warn(
      `Inertia.replace() has been deprecated and will be removed in a future release. Please use Inertia.${
        options.method ?? 'get'
      }() instead.`,
    )

    return this.visit(url, { preserveState: true, ...options, replace: true })
  }

  protected loadDeferredProps(): void {
    const deferred = currentPage.get().meta?.deferredProps

    if (deferred) {
      Object.entries(deferred).forEach(([_, group]) => {
        this.reload({ only: group })
      })
    }
  }

  protected transformUrlAndData(
    href: string | URL,
    data: RequestPayload,
    method: Method,
    forceFormData: VisitOptions['forceFormData'],
    queryStringArrayFormat: VisitOptions['queryStringArrayFormat'],
  ): [URL, RequestPayload] {
    let url = typeof href === 'string' ? hrefToUrl(href) : href

    if ((hasFiles(data) || forceFormData) && !isFormData(data)) {
      data = objectToFormData(data)
    }

    if (isFormData(data)) {
      return [url, data]
    }

    const [_href, _data] = mergeDataIntoQueryString(method, url, data, queryStringArrayFormat)

    return [hrefToUrl(_href), _data]
  }

  protected initializeVisit(): void {
    if (this.isBackForwardVisit()) {
      this.handleBackForwardVisit()
    } else if (this.isLocationVisit()) {
      this.handleLocationVisit()
    } else {
      this.handleInitialPageVisit()
    }
  }

  protected registerListener(type: string, listener: EventListener): VoidFunction {
    document.addEventListener(type, listener)

    return () => document.removeEventListener(type, listener)
  }

  protected clearRememberedStateOnReload(): void {
    if (navigationType.isReload()) {
      History.deleteState(History.rememberedState)
    }
  }

  protected handleInitialPageVisit(): void {
    currentPage.setUrlHash(window.location.hash)
    currentPage.set(currentPage.get(), { preserveState: true }).then(() => {
      fireNavigateEvent(currentPage.get())
    })
  }

  protected setupEventListeners(): void {
    window.addEventListener('popstate', this.handlePopstateEvent.bind(this))
    document.addEventListener('scroll', debounce(Scroll.onScroll, 100), true)
  }

  protected isBackForwardVisit(): boolean {
    return History.hasAnyState() && navigationType.isBackForward()
  }

  protected handleBackForwardVisit(): void {
    History.setState('version', currentPage.get().meta.assetVersion)

    currentPage.set(History.getAllState(), { preserveScroll: true, preserveState: true }).then(() => {
      Scroll.restore(currentPage.get())
      fireNavigateEvent(currentPage.get())
    })
  }

  protected isLocationVisit(): boolean {
    return SessionStorage.exists()
  }

  /**
   * @link https://inertiajs.com/redirects#external-redirects
   */
  protected handleLocationVisit(): void {
    const locationVisit: LocationVisit = JSON.parse(SessionStorage.get() || '{}')

    SessionStorage.remove()

    currentPage.setUrlHash(window.location.hash)
    currentPage.remember(History.getState<Page['rememberedState']>(History.rememberedState, {}))
    currentPage.scrollRegions(History.getState<Page['scrollRegions']>(History.scrollRegions, []))

    currentPage
      .set(currentPage.get(), {
        preserveScroll: locationVisit.preserveScroll,
        preserveState: true,
      })
      .then(() => {
        if (locationVisit.preserveScroll) {
          Scroll.restore(currentPage.get())
        }

        fireNavigateEvent(currentPage.get())
      })
  }

  protected handlePopstateEvent(event: PopStateEvent): void {
    const page = event.state

    if (page === null) {
      const url = hrefToUrl(currentPage.get().url)
      url.hash = window.location.hash

      History.replaceState({ ...currentPage.get(), url: url.href })
      Scroll.reset(currentPage.get())

      return
    }

    currentPage
      .resolve(page.component)
      .then((component) => currentPage.swap({ component, page, preserveState: false }))
      .then(() => {
        Scroll.restore(page)
        fireNavigateEvent(page)
      })
  }
}
