import Axios, { AxiosError, CancelTokenSource, Method } from 'axios'

import { debounce } from './debounce'
import { fireBeforeEvent, fireErrorEvent, fireFinishEvent, fireInvalidEvent, fireNavigateEvent, fireProgressEvent, fireStartEvent, fireSuccessEvent, InertiaEvents } from './events'
import { modal } from './modal'
import { hrefToUrl, mergeDataIntoQueryString, urlWithoutHash } from './url'

export type VisitOptions = {
  method: Method
  data: any
  replace: boolean
  preserveScroll: boolean | ((props: Page) => boolean)
  preserveState: boolean | ((props: Page) => boolean) | null
  only: string[]
  headers: Record<string, string>
  onCancelToken: (cancelToken: CancelTokenSource) => void
  onBefore: (visit: Visit) => void | boolean
  onStart: (visit: Visit) => void | boolean
  onProgress: (progress: ProgressEvent) => void
  onFinish: () => void
  onCancel: () => void
  onSuccess: (page: Page) => void | Promise<any>
}

export type Visit = VisitOptions & {
  url: string
  cancelled?: boolean
  completed?: boolean
  interrupted?: boolean
  cancelToken?: CancelTokenSource
}

export interface Page<CustomPageProps = Record<string, unknown>> {
  component: string
  props: CustomPageProps
  url: string
  version: string | null
  scrollRegions: { top: number, left: number }[]
  rememberedState: {
    [key: string]: any
  }
}

export type InertiaProgressEvent = ProgressEvent & {percentage: number}




const noop = () => null

export const AxiosInstance = Axios.create({
  headers: {
    Accept: 'text/html, application/xhtml+xml',
    'X-Requested-With': 'XMLHttpRequest',
    'X-Inertia': true,
  },
})

class InertiaJS {
  resolveComponent: (component: string) => string
  swapComponent: (options: {component: string, page: Page, preserveState: VisitOptions['preserveState']}) => Promise<void>
  transformProps: (props: any) => any

  activeVisit: Visit
  visitId: Record<string, never>
  page: Page

  init({
    initialPage,
    resolveComponent,
    swapComponent,
    transformProps,
  }: {initialPage: Page, resolveComponent: InertiaJS['resolveComponent'], swapComponent: InertiaJS['swapComponent'], transformProps: InertiaJS['transformProps']}) {
    this.resolveComponent = resolveComponent
    this.swapComponent = swapComponent
    this.transformProps = transformProps
    this.handleInitialPageVisit(initialPage)
    this.setupEventListeners()
  }

  handleInitialPageVisit(page: Page) {
    if (this.isBackForwardVisit()) {
      this.handleBackForwardVisit(page)
    } else if (this.isLocationVisit()) {
      this.handleLocationVisit(page)
    } else {
      page.url += window.location.hash
      this.setPage(page)
    }
    fireNavigateEvent(page)
  }

  setupEventListeners() {
    window.addEventListener('popstate', this.handlePopstateEvent.bind(this))
    document.addEventListener('scroll', debounce(this.handleScrollEvent.bind(this), 100), true)
  }

  scrollRegions() {
    return document.querySelectorAll('[scroll-region]')
  }

  handleScrollEvent(event) {
    if (typeof event.target.hasAttribute === 'function' && event.target.hasAttribute('scroll-region')) {
      this.saveScrollPositions()
    }
  }

  saveScrollPositions() {
    this.replaceState({
      ...this.page,
      scrollRegions: Array.prototype.slice.call(this.scrollRegions()).map(region => {
        return {
          top: region.scrollTop,
          left: region.scrollLeft,
        }
      }),
    })
  }

  resetScrollPositions() {
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

  restoreScrollPositions() {
    if (this.page.scrollRegions) {
      this.scrollRegions().forEach((region, index) => {
        region.scrollTop = this.page.scrollRegions[index].top
        region.scrollLeft = this.page.scrollRegions[index].left
      })
    }
  }

  isBackForwardVisit() {
    return window.history.state
      && window.performance
      && window.performance.getEntriesByType('navigation').length
      && window.performance.getEntriesByType('navigation')[0].entryType === 'back_forward'
  }

  handleBackForwardVisit(page: Page) {
    window.history.state.version = page.version
    this.setPage(window.history.state, { preserveScroll: true }).then(() => {
      this.restoreScrollPositions()
    })
  }

  locationVisit(url: URL, preserveScroll: VisitOptions['preserveScroll']) {
    try {
      window.sessionStorage.setItem('inertiaLocationVisit', JSON.stringify({ preserveScroll }))
      window.location.href = url.href
      if (urlWithoutHash(window.location).href === urlWithoutHash(url).href) {
        window.location.reload()
      }
    } catch (error) {
      return false
    }
  }

  isLocationVisit() {
    try {
      return window.sessionStorage.getItem('inertiaLocationVisit') !== null
    } catch (error) {
      return false
    }
  }

  handleLocationVisit(page: Page) {
    const locationVisit: Visit = JSON.parse(window.sessionStorage.getItem('inertiaLocationVisit'))
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

  isLocationVisitResponse(response: ResponseInit) {
    return !!response && response.status === 409 && response.headers['x-inertia-location']
  }

  isInertiaResponse(response: ResponseInit) {
    return !!response && response.headers['x-inertia']
  }

  createVisitId() {
    this.visitId = {}
    return this.visitId
  }

  cancelVisit(visit: Visit, { cancelled = false, interrupted = false }) {
    if (visit && !visit.completed && !visit.cancelled && !visit.interrupted) {
      visit.cancelToken.cancel()
      visit.onCancel()
      visit.completed = false
      visit.cancelled = cancelled
      visit.interrupted = interrupted
      fireFinishEvent(visit)
      visit.onFinish()
    }
  }

  finishVisit(visit: Visit) {
    if (!visit.cancelled && !visit.interrupted) {
      visit.completed = true
      visit.cancelled = false
      visit.interrupted = false
      fireFinishEvent(visit)
      visit.onFinish()
    }
  }

  visit(url: string, {
    method = 'get',
    data = {},
    replace = false,
    preserveScroll = false,
    preserveState = false,
    only = [],
    headers = {},
    onCancelToken = noop,
    onBefore = noop,
    onStart = noop,
    onProgress = noop,
    onFinish = noop,
    onCancel = noop,
    onSuccess = noop,
  }: Partial<VisitOptions> = {}) {
    let visitURL: URL
    [visitURL, data] = mergeDataIntoQueryString(method, hrefToUrl(url), data)
    const visit: Visit = { url, method, data, replace, preserveScroll, preserveState, only, headers, onCancelToken, onBefore, onStart, onProgress, onFinish, onCancel, onSuccess }

    if (onBefore(visit) === false || !fireBeforeEvent(visit)) {
      return
    }

    this.cancelVisit(this.activeVisit, { interrupted: true })
    this.saveScrollPositions()

    const visitId = this.createVisitId()
    this.activeVisit = visit
    this.activeVisit.cancelToken = Axios.CancelToken.source()
    onCancelToken({ token: this.activeVisit.cancelToken.token, cancel: () => this.cancelVisit(this.activeVisit, { cancelled: true }) })

    fireStartEvent(visit)
    onStart(visit)

    return new Proxy(
      AxiosInstance({
        method,
        url: urlWithoutHash(visitURL).href,
        data: method === 'get' ? {} : data,
        params: method === 'get' ? data : {},
        cancelToken: this.activeVisit.cancelToken.token,
        headers: {
          ...headers,
          ...(only.length ? {
            'X-Inertia-Partial-Component': this.page.component,
            'X-Inertia-Partial-Data': only.join(','),
          } : {}),
          ...(this.page.version ? { 'X-Inertia-Version': this.page.version } : {}),
        },
        onUploadProgress: (progress: InertiaProgressEvent) => {
          progress.percentage = Math.round(progress.loaded / progress.total * 100)
          fireProgressEvent(progress)
          onProgress(progress)
        },
      }).then(response => {
        if (!this.isInertiaResponse(response)) {
          return Promise.reject({ response })
        }
        if (only.length && response.data.component === this.page.component) {
          response.data.props = { ...this.page.props, ...response.data.props }
        }
        const responseUrl = hrefToUrl(response.data.url)
        if (visitURL.hash && !responseUrl.hash && urlWithoutHash(visitURL).href === responseUrl.href) {
          responseUrl.hash = visitURL.hash
          response.data.url = responseUrl.href
        }
        return this.setPage(response.data, { visitId, replace, preserveScroll, preserveState })
      }).then(() => {
        fireSuccessEvent(this.page)
        return onSuccess(this.page)
      }).catch((error: AxiosError) => {
        if (this.isInertiaResponse(error.response)) {
          return this.setPage(error.response.data, { visitId })
        } else if (this.isLocationVisitResponse(error.response)) {
          const locationUrl = hrefToUrl(error.response.headers['x-inertia-location'])
          if (visitURL.hash && !locationUrl.hash && urlWithoutHash(visitURL).href === locationUrl.href) {
            locationUrl.hash = visitURL.hash
          }
          this.locationVisit(locationUrl, preserveScroll)
        } else if (error.response) {
          if (fireInvalidEvent(error.response)) {
            modal.show(error.response.data)
          }
        } else {
          return Promise.reject(error)
        }
      }).then(() => {
        this.finishVisit(visit)
      }).catch((error: AxiosError) => {
        if (!Axios.isCancel(error)) {
          const throwError = fireErrorEvent(error)
          this.finishVisit(visit)
          if (throwError) {
            return Promise.reject(error)
          }
        }
      }), {
        get: function(target, prop) {
          if (typeof prop === 'string' && ['then', 'catch', 'finally'].includes(prop)) {
            console.warn('Inertia.js visit promises have been deprecated and will be removed in a future release. Please use the new visit event callbacks instead.\n\nLearn more at https://inertiajs.com/manual-visits#promise-deprecation')
          }
          return typeof target[prop] === 'function'
            ? target[prop].bind(target)
            : target[prop]
        },
      },
    )
  }

  setPage(page: Page, { visitId = this.createVisitId(), replace = false, preserveScroll = false, preserveState = false }: Partial<Pick<VisitOptions, 'replace' | 'preserveScroll' | 'preserveState'> & {visitId: InertiaJS['visitId']}> = {}) {
    return Promise.resolve(this.resolveComponent(page.component)).then(component => {
      if (visitId === this.visitId) {
        page.scrollRegions = page.scrollRegions || []
        page.rememberedState = page.rememberedState || {}
        preserveState = typeof preserveState === 'function' ? preserveState(page) : preserveState
        preserveScroll = typeof preserveScroll === 'function' ? preserveScroll(page) : preserveScroll
        replace = replace || hrefToUrl(page.url).href === window.location.href
        replace ? this.replaceState(page) : this.pushState(page)
        const clone = JSON.parse(JSON.stringify(page))
        clone.props = this.transformProps(clone.props)
        this.swapComponent({ component, page: clone, preserveState }).then(() => {
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

  pushState(page: Page) {
    this.page = page
    window.history.pushState(page, '', page.url)
  }

  replaceState(page: Page) {
    this.page = page
    window.history.replaceState(page, '', page.url)
  }

  handlePopstateEvent(event: PopStateEvent) {
    if (event.state !== null) {
      const page = event.state
      const visitId = this.createVisitId()
      return Promise.resolve(this.resolveComponent(page.component)).then(component => {
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

  get(url: string, data = {}, options?: VisitOptions) {
    return this.visit(url, { ...options, method: 'get', data })
  }

  reload(options?: VisitOptions) {
    return this.visit(window.location.href, { ...options, preserveScroll: true, preserveState: true })
  }

  replace(url, options?: VisitOptions) {
    console.warn(`Inertia.replace() has been deprecated and will be removed in a future release. Please use Inertia.${options.method ?? 'get'}() instead.`)
    return this.visit(url, { preserveState: true, ...options, replace: true })
  }

  post(url, data = {}, options?: VisitOptions) {
    return this.visit(url, { preserveState: true, ...options, method: 'post', data })
  }

  put(url, data = {}, options?: VisitOptions) {
    return this.visit(url, { preserveState: true, ...options, method: 'put', data })
  }

  patch(url, data = {}, options?: VisitOptions) {
    return this.visit(url, { preserveState: true, ...options, method: 'patch', data })
  }

  delete(url, options?: VisitOptions) {
    return this.visit(url, { preserveState: true, ...options, method: 'delete' })
  }

  remember(data, key = 'default') {
    this.replaceState({
      ...this.page,
      rememberedState: {
        ...this.page.rememberedState,
        [key]: data,
      },
    })
  }

  restore(key = 'default') {
    return window.history.state?.rememberedState?.[key]
  }

  on<T extends keyof InertiaEvents>(type: T, callback: (event: InertiaEvents[T]) => any) {
    const listener = event => {
      const response = callback(event)
      if (event.cancelable && !event.defaultPrevented && response === false) {
        event.preventDefault()
      }
    }

    document.addEventListener(`inertia:${type}`, listener)
    return () => document.removeEventListener(`inertia:${type}`, listener)
  }
}

export const Inertia = new InertiaJS()