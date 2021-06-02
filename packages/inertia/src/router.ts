import modal from './modal'
import debounce from './debounce'
import { hasFiles } from './files'
import { objectToFormData } from './formData'
import { AxiosResponse, default as Axios } from 'axios'
import { hrefToUrl, mergeDataIntoQueryString, urlWithoutHash } from './url'
import { ActiveVisit, LocationVisit, Method, Page, PageHandler, PageResolver, PreserveStateOption, RequestPayload, Visit, VisitId } from './types'
import { fireBeforeEvent, fireErrorEvent, fireExceptionEvent, fireFinishEvent, fireInvalidEvent, fireNavigateEvent, fireProgressEvent, fireStartEvent, fireSuccessEvent } from './events'

export class Router {
  protected resolveComponent!: PageResolver
  protected swapComponent!: PageHandler
  protected activeVisit?: ActiveVisit
  protected visitId: VisitId = null
  protected page!: Page

  public init({
    initialPage,
    resolveComponent,
    swapComponent,
  }: {
    initialPage: Page,
    resolveComponent: PageResolver,
    swapComponent: PageHandler,
  }): void {
    this.page = initialPage
    this.resolveComponent = resolveComponent
    this.swapComponent = swapComponent
    this.handleInitialPageVisit()
    this.setupEventListeners()
  }

  protected handleInitialPageVisit(): void {
    if (this.isBackForwardVisit()) {
      this.handleBackForwardVisit(this.page)
    } else if (this.isLocationVisit()) {
      this.handleLocationVisit(this.page)
    } else {
      if (typeof window !== 'undefined') {
        this.page.url += window.location.hash
      }
      this.setPage(this.page)
    }
    fireNavigateEvent(this.page)
  }

  protected setupEventListeners(): void {
    window.addEventListener('popstate', this.handlePopstateEvent.bind(this))
    document.addEventListener('scroll', debounce(this.handleScrollEvent.bind(this), 100), true)
  }

  protected scrollRegions(): NodeListOf<Element> {
    return document.querySelectorAll('[scroll-region]')
  }

  protected handleScrollEvent(event: Event): void {
    if (typeof (event.target as Element).hasAttribute === 'function' && (event.target as Element).hasAttribute('scroll-region')) {
      this.saveScrollPositions()
    }
  }

  protected saveScrollPositions(): void {
    this.replaceState({
      ...this.page,
      scrollRegions: Array.from(this.scrollRegions()).map(region => {
        return {
          top: region.scrollTop,
          left: region.scrollLeft,
        }
      }),
    })
  }

  protected resetScrollPositions(): void {
    document.documentElement.scrollTop = 0
    document.documentElement.scrollLeft = 0
    this.scrollRegions().forEach(region => {
      region.scrollTop = 0
      region.scrollLeft = 0
    })
    this.saveScrollPositions()
    if (window.location.hash) {
      document.getElementById(window.location.hash.slice(1))?.scrollIntoView()
    }
  }

  protected restoreScrollPositions(): void {
    if (this.page.scrollRegions) {
      this.scrollRegions().forEach((region: Element, index: number) => {
        region.scrollTop = this.page.scrollRegions[index].top
        region.scrollLeft = this.page.scrollRegions[index].left
      })
    }
  }

  protected isBackForwardVisit(): boolean {
    return typeof window !== 'undefined'
        && window.history.state
        && window.performance
        && window.performance.getEntriesByType('navigation').length > 0
        && (window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming).type === 'back_forward'
  }

  protected handleBackForwardVisit(page: Page): void {
    window.history.state.version = page.version
    this.setPage(window.history.state, { preserveScroll: true }).then(() => {
      this.restoreScrollPositions()
    })
  }

  protected locationVisit(url: URL, preserveScroll: LocationVisit['preserveScroll']): boolean|void {
    try {
      const locationVisit: LocationVisit = { preserveScroll }
      window.sessionStorage.setItem('inertiaLocationVisit', JSON.stringify(locationVisit))
      window.location.href = url.href
      if (urlWithoutHash(window.location).href === urlWithoutHash(url).href) {
        window.location.reload()
      }
    } catch (error) {
      return false
    }
  }

  protected isLocationVisit(): boolean {
    try {
      return window.sessionStorage.getItem('inertiaLocationVisit') !== null
    } catch (error) {
      return false
    }
  }

  protected handleLocationVisit(page: Page): void {
    const locationVisit: LocationVisit = JSON.parse(window.sessionStorage.getItem('inertiaLocationVisit') || '')
    window.sessionStorage.removeItem('inertiaLocationVisit')
    page.url += window.location.hash
    page.rememberedState = window.history.state?.rememberedState ?? {}
    page.scrollRegions = window.history.state?.scrollRegions ?? []
    this.setPage(page, { preserveScroll: locationVisit.preserveScroll }).then(() => {
      if (locationVisit.preserveScroll) {
        this.restoreScrollPositions()
      }
    })
  }

  protected isLocationVisitResponse(response: AxiosResponse): boolean {
    return response && response.status === 409 && response.headers['x-inertia-location']
  }

  protected isInertiaResponse(response: AxiosResponse): boolean {
    return response?.headers['x-inertia']
  }

  protected createVisitId(): VisitId {
    this.visitId = {}
    return this.visitId
  }

  protected cancelVisit(
    activeVisit: ActiveVisit,
    { cancelled = false, interrupted = false}: { cancelled?: boolean, interrupted?: boolean },
  ): void {
    if (activeVisit && !activeVisit.completed && !activeVisit.cancelled && !activeVisit.interrupted) {
      activeVisit.cancelToken.cancel()
      activeVisit.onCancel()
      activeVisit.completed = false
      activeVisit.cancelled = cancelled
      activeVisit.interrupted = interrupted
      fireFinishEvent(activeVisit)
      activeVisit.onFinish(activeVisit)
    }
  }

  protected finishVisit(visit: ActiveVisit): void {
    if (!visit.cancelled && !visit.interrupted) {
      visit.completed = true
      visit.cancelled = false
      visit.interrupted = false
      fireFinishEvent(visit)
      visit.onFinish(visit)
    }
  }

  protected resolvePreserveOption(value: PreserveStateOption, page: Page): boolean|string {
    if (typeof value === 'function') {
      return value(page)
    } else if (value === 'errors') {
      return Object.keys(page.props.errors || {}).length > 0
    } else {
      return value
    }
  }

  public visit(href: string|URL, {
    method = Method.GET,
    data = {},
    replace = false,
    preserveScroll = false,
    preserveState = false,
    only = [],
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
  }: {
    method?: Method,
    data?: RequestPayload,
    replace?: boolean,
    preserveScroll?: PreserveStateOption,
    preserveState?: PreserveStateOption
    only?: Array<string>,
    headers?: Record<string, string>,
    errorBag?: string,
    forceFormData?: boolean,
    onCancelToken?: { ({ cancel }: { cancel: VoidFunction }): void },
    onBefore?: (visit: Visit) => boolean|void,
    onStart?: (visit: Visit) => void,
    onProgress?: (event: { percentage: number }|void) => void,
    onFinish?: (visit: Visit) => void,
    onCancel?: () => void,
    onSuccess?: (page: Page) => void,
    onError?: (errors: Record<string, unknown>) => void,
  } = {}): void {
    let url = typeof href === 'string' ? hrefToUrl(href) : href

    if ((hasFiles(data) || forceFormData) && !(data instanceof FormData)) {
      data = objectToFormData(data)
    }

    if (!(data instanceof FormData)) {
      const [_href, _data] = mergeDataIntoQueryString(method, url, data)
      url = hrefToUrl(_href)
      data = _data
    }

    const visit: Visit = {
      url,
      method,
      data,
      replace,
      preserveScroll,
      preserveState,
      only,
      headers,
      errorBag,
      forceFormData,
      cancelled: false,
      completed: false,
      interrupted: false,
    }

    if (onBefore(visit) === false || !fireBeforeEvent(visit)) {
      return
    }

    if (this.activeVisit) {
      this.cancelVisit(this.activeVisit, { interrupted: true })
    }

    this.saveScrollPositions()

    const visitId = this.createVisitId()
    this.activeVisit = { ...visit, onCancelToken, onBefore, onStart, onProgress, onFinish, onCancel, onSuccess, onError, cancelToken: Axios.CancelToken.source() }

    onCancelToken({
      cancel: () => {
        if (this.activeVisit) {
          this.cancelVisit(this.activeVisit, { cancelled: true })
        }
      },
    })

    fireStartEvent(visit)
    onStart(visit)

    Axios({
      method,
      url: urlWithoutHash(url).href,
      data: method === Method.GET ? {} : data,
      params: method === Method.GET ? data : {},
      cancelToken: this.activeVisit.cancelToken.token,
      headers: {
        ...headers,
        Accept: 'text/html, application/xhtml+xml',
        'X-Requested-With': 'XMLHttpRequest',
        'X-Inertia': true,
        ...(only.length ? {
          'X-Inertia-Partial-Component': this.page.component,
          'X-Inertia-Partial-Data': only.join(','),
        } : {}),
        ...(errorBag.length ? { 'X-Inertia-Error-Bag': errorBag } : {}),
        ...(this.page.version ? { 'X-Inertia-Version': this.page.version } : {}),
      },
      onUploadProgress: progress => {
        if (data instanceof FormData) {
          progress.percentage = Math.round(progress.loaded / progress.total * 100)
          fireProgressEvent(progress)
          onProgress(progress)
        }
      },
    }).then(response => {
      if (!this.isInertiaResponse(response)) {
        return Promise.reject({ response })
      }

      const pageResponse: Page = response.data
      if (only.length && pageResponse.component === this.page.component) {
        pageResponse.props = { ...this.page.props, ...pageResponse.props }
      }
      preserveScroll = this.resolvePreserveOption(preserveScroll, pageResponse) as boolean
      preserveState = this.resolvePreserveOption(preserveState, pageResponse)
      if (preserveState && window.history.state?.rememberedState && pageResponse.component === this.page.component) {
        pageResponse.rememberedState = window.history.state.rememberedState
      }
      const requestUrl = url
      const responseUrl = hrefToUrl(pageResponse.url)
      if (requestUrl.hash && !responseUrl.hash && urlWithoutHash(requestUrl).href === responseUrl.href) {
        responseUrl.hash = requestUrl.hash
        pageResponse.url = responseUrl.href
      }
      return this.setPage(pageResponse, { visitId, replace, preserveScroll, preserveState })
    }).then(() => {
      const errors = this.page.props.errors || {}
      if (Object.keys(errors).length > 0) {
        fireErrorEvent(errors[errorBag] || errors)
        return onError(errors[errorBag] || errors)
      }
      fireSuccessEvent(this.page)
      return onSuccess(this.page)
    }).catch(error => {
      if (this.isInertiaResponse(error.response)) {
        return this.setPage(error.response.data, { visitId })
      } else if (this.isLocationVisitResponse(error.response)) {
        const locationUrl = hrefToUrl(error.response.headers['x-inertia-location'])
        const requestUrl = url
        if (requestUrl.hash && !locationUrl.hash && urlWithoutHash(requestUrl).href === locationUrl.href) {
          locationUrl.hash = requestUrl.hash
        }
        this.locationVisit(locationUrl, preserveScroll === true)
      } else if (error.response) {
        if (fireInvalidEvent(error.response)) {
          modal.show(error.response.data)
        }
      } else {
        return Promise.reject(error)
      }
    }).then(() => {
      if (this.activeVisit) {
        this.finishVisit(this.activeVisit)
      }
    }).catch(error => {
      if (!Axios.isCancel(error)) {
        const throwException = fireExceptionEvent(error)
        if (this.activeVisit) {
          this.finishVisit(this.activeVisit)
        }
        if (throwException) {
          return Promise.reject(error)
        }
      }
    })
  }

  protected setPage(page: Page, {
    visitId = this.createVisitId(),
    replace = false,
    preserveScroll = false,
    preserveState = false,
  }: {
    visitId?: VisitId,
    replace?: boolean,
    preserveScroll?: PreserveStateOption
    preserveState?: PreserveStateOption
  } = {}): Promise<void> {
    return Promise.resolve(this.resolveComponent(page.component)).then(component => {
      if (visitId === this.visitId) {
        page.scrollRegions = page.scrollRegions || []
        page.rememberedState = page.rememberedState || {}
        replace = replace || hrefToUrl(page.url).href === window.location.href
        replace ? this.replaceState(page) : this.pushState(page)
        this.swapComponent({ component, page, preserveState }).then(() => {
          if (!preserveScroll) {
            this.resetScrollPositions()
          }
          if (!replace) {
            fireNavigateEvent(page)
          }
        })
      }
    })
  }

  protected pushState(page: Page): void {
    this.page = page
    window.history.pushState(page, '', page.url)
  }

  protected replaceState(page: Page): void {
    this.page = page
    window.history.replaceState(page, '', page.url)
  }

  protected handlePopstateEvent(event: PopStateEvent): void {
    if (event.state !== null) {
      const page = event.state
      const visitId = this.createVisitId()
      Promise.resolve(this.resolveComponent(page.component)).then(component => {
        if (visitId === this.visitId) {
          this.page = page
          this.swapComponent({ component, page, preserveState: false }).then(() => {
            this.restoreScrollPositions()
            fireNavigateEvent(page)
          })
        }
      })
    } else {
      const url = hrefToUrl(this.page.url)
      url.hash = window.location.hash
      this.replaceState({ ...this.page, url: url.href })
      this.resetScrollPositions()
    }
  }

  public get(url: URL|string, data: RequestPayload = {}, options : Record<string, unknown> = {}): void {
    return this.visit(url, { ...options, method: Method.GET, data })
  }

  public reload(options: Record<string, unknown> = {}): void {
    return this.visit(window.location.href, { ...options, preserveScroll: true, preserveState: true })
  }

  public replace(url: URL|string, options: Record<string, unknown> = {}): void {
    console.warn(`Inertia.replace() has been deprecated and will be removed in a future release. Please use Inertia.${options.method ?? 'get'}() instead.`)
    return this.visit(url, { preserveState: true, ...options, replace: true })
  }

  public post(url: URL|string, data: RequestPayload = {}, options: Record<string, unknown> = {}): void {
    return this.visit(url, { preserveState: true, ...options, method: Method.POST, data })
  }

  public put(url: URL|string, data: RequestPayload = {}, options: Record<string, unknown> = {}): void {
    return this.visit(url, { preserveState: true, ...options, method: Method.PUT, data })
  }

  public patch(url: URL|string, data: RequestPayload = {}, options: Record<string, unknown> = {}): void {
    return this.visit(url, { preserveState: true, ...options, method: Method.PATCH, data })
  }

  public delete(url: URL|string, options: Record<string, unknown> = {}): void {
    return this.visit(url, { preserveState: true, ...options, method: Method.DELETE })
  }

  public remember(data: unknown, key = 'default'): void {
    this.replaceState({
      ...this.page,
      rememberedState: {
        ...this.page.rememberedState,
        [key]: data,
      },
    })
  }

  public restore(key = 'default'): unknown {
    return window.history.state?.rememberedState?.[key]
  }

  public on(type: string, callback: CallableFunction): VoidFunction {
    const listener: EventListener = event => {
      const response = callback(event)
      if (event.cancelable && !event.defaultPrevented && response === false) {
        event.preventDefault()
      }
    }

    document.addEventListener(`inertia:${type}`, listener)
    return () => document.removeEventListener(`inertia:${type}`, listener)
  }
}
