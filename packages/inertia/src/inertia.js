import Axios from 'axios'
import debounce from './debounce'
import modal from './modal'
import { fireBeforeEvent, fireErrorEvent, fireExceptionEvent, fireFinishEvent, fireInvalidEvent, fireNavigateEvent, fireProgressEvent, fireStartEvent, fireSuccessEvent } from './events' // prettier-ignore
import { hrefToUrl, mergeDataIntoQueryString, urlWithoutHash } from './url'
import { hasFiles } from './files'
import { objectToFormData } from './formData'

export default {
  resolveComponent: null,
  resolveErrors: page => (page.props.errors || {}),
  swapComponent: null,
  transformProps: props => props,
  activeVisit: null,
  visitId: null,
  page: null,

  init({ initialPage, resolveComponent, resolveErrors, swapComponent, transformProps }) {
    this.resolveComponent = resolveComponent
    this.resolveErrors = resolveErrors || this.resolveErrors
    this.swapComponent = swapComponent
    this.transformProps = transformProps || this.transformProps
    this.handleInitialPageVisit(initialPage)
    this.setupEventListeners()
  },

  handleInitialPageVisit(page) {
    if (this.isBackForwardVisit()) {
      this.handleBackForwardVisit(page)
    } else if (this.isLocationVisit()) {
      this.handleLocationVisit(page)
    } else {
      page.url += window.location.hash
      this.setPage(page)
    }
    fireNavigateEvent(page)
  },

  setupEventListeners() {
    window.addEventListener('popstate', this.handlePopstateEvent.bind(this))
    document.addEventListener('scroll', debounce(this.handleScrollEvent.bind(this), 100), true)
  },

  scrollRegions() {
    return document.querySelectorAll('[scroll-region]')
  },

  handleScrollEvent(event) {
    if (typeof event.target.hasAttribute === 'function' && event.target.hasAttribute('scroll-region')) {
      this.saveScrollPositions()
    }
  },

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
  },

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
  },

  restoreScrollPositions() {
    if (this.page.scrollRegions) {
      this.scrollRegions().forEach((region, index) => {
        region.scrollTop = this.page.scrollRegions[index].top
        region.scrollLeft = this.page.scrollRegions[index].left
      })
    }
  },

  isBackForwardVisit() {
    return window.history.state
      && window.performance
      && window.performance.getEntriesByType('navigation').length
      && window.performance.getEntriesByType('navigation')[0].type === 'back_forward'
  },

  handleBackForwardVisit(page) {
    window.history.state.version = page.version
    this.setPage(window.history.state, { preserveScroll: true }).then(() => {
      this.restoreScrollPositions()
    })
  },

  locationVisit(url, preserveScroll) {
    try {
      window.sessionStorage.setItem('inertiaLocationVisit', JSON.stringify({ preserveScroll }))
      window.location.href = url.href
      if (urlWithoutHash(window.location).href === urlWithoutHash(url).href) {
        window.location.reload()
      }
    } catch (error) {
      return false
    }
  },

  isLocationVisit() {
    try {
      return window.sessionStorage.getItem('inertiaLocationVisit') !== null
    } catch (error) {
      return false
    }
  },

  handleLocationVisit(page) {
    const locationVisit = JSON.parse(window.sessionStorage.getItem('inertiaLocationVisit'))
    window.sessionStorage.removeItem('inertiaLocationVisit')
    page.url += window.location.hash
    page.rememberedState = window.history.state?.rememberedState ?? {}
    page.scrollRegions = window.history.state?.scrollRegions ?? []
    this.setPage(page, { preserveScroll: locationVisit.preserveScroll }).then(() => {
      if (locationVisit.preserveScroll) {
        this.restoreScrollPositions()
      }
    })
  },

  isLocationVisitResponse(response) {
    return response && response.status === 409 && response.headers['x-inertia-location']
  },

  isInertiaResponse(response) {
    return response?.headers['x-inertia']
  },

  createVisitId() {
    this.visitId = {}
    return this.visitId
  },

  cancelVisit(visit, { cancelled = false, interrupted = false }) {
    if (visit && !visit.completed && !visit.cancelled && !visit.interrupted) {
      visit.cancelToken.cancel()
      visit.onCancel()
      visit.completed = false
      visit.cancelled = cancelled
      visit.interrupted = interrupted
      fireFinishEvent(visit)
      visit.onFinish(visit)
    }
  },

  finishVisit(visit) {
    if (!visit.cancelled && !visit.interrupted) {
      visit.completed = true
      visit.cancelled = false
      visit.interrupted = false
      fireFinishEvent(visit)
      visit.onFinish(visit)
    }
  },

  resolvePreserveOption(value, page) {
    if (typeof value === 'function') {
      return value(page)
    } else if (value === 'errors') {
      return Object.keys(this.resolveErrors(page)).length > 0
    } else {
      return value
    }
  },

  visit(url, {
    method = 'get',
    data = {},
    replace = false,
    preserveScroll = false,
    preserveState = false,
    only = [],
    headers = {},
    errorBag = null,
    forceFormData = false,
    onCancelToken = () => ({}),
    onBefore = () => ({}),
    onStart = () => ({}),
    onProgress = () => ({}),
    onFinish = () => ({}),
    onCancel = () => ({}),
    onSuccess = () => ({}),
    onError = () => ({}),
  } = {}) {
    method = method.toLowerCase();
    [url, data] = mergeDataIntoQueryString(method, hrefToUrl(url), data)

    const visitHasFiles = hasFiles(data)
    if (method !== 'get' && (visitHasFiles || forceFormData)) {
      data = objectToFormData(data)
    }

    const visit = { url, method, data, replace, preserveScroll, preserveState, only, headers, errorBag, forceFormData, onCancelToken, onBefore, onStart, onProgress, onFinish, onCancel, onSuccess, onError }

    if (onBefore(visit) === false || !fireBeforeEvent(visit)) {
      return
    }

    this.cancelVisit(this.activeVisit, { interrupted: true })
    this.saveScrollPositions()

    let visitId = this.createVisitId()
    this.activeVisit = visit
    this.activeVisit.cancelToken = Axios.CancelToken.source()
    onCancelToken({ cancel: () => this.cancelVisit(this.activeVisit, { cancelled: true }) })

    fireStartEvent(visit)
    onStart(visit)

    return new Proxy(
      Axios({
        method,
        url: urlWithoutHash(url).href,
        data: method === 'get' ? {} : data,
        params: method === 'get' ? data : {},
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
          ...(errorBag ? { 'X-Inertia-Error-Bag': errorBag } : {}),
          ...(this.page.version ? { 'X-Inertia-Version': this.page.version } : {}),
        },
        onUploadProgress: progress => {
          if (visitHasFiles) {
            progress.percentage = Math.round(progress.loaded / progress.total * 100)
            fireProgressEvent(progress)
            onProgress(progress)
          }
        },
      }).then(response => {
        if (!this.isInertiaResponse(response)) {
          return Promise.reject({ response })
        }
        if (only.length && response.data.component === this.page.component) {
          response.data.props = { ...this.page.props, ...response.data.props }
        }
        preserveScroll = this.resolvePreserveOption(preserveScroll, response.data)
        preserveState = this.resolvePreserveOption(preserveState, response.data)
        if (preserveState && window.history.state?.rememberedState && response.data.component === this.page.component) {
          response.data.rememberedState = window.history.state.rememberedState
        }
        const responseUrl = hrefToUrl(response.data.url)
        if (url.hash && !responseUrl.hash && urlWithoutHash(url).href === responseUrl.href) {
          responseUrl.hash = url.hash
          response.data.url = responseUrl.href
        }
        return this.setPage(response.data, { visitId, replace, preserveScroll, preserveState })
      }).then(() => {
        const errors = this.resolveErrors(this.page)
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
          let locationUrl = hrefToUrl(error.response.headers['x-inertia-location'])
          if (url.hash && !locationUrl.hash && urlWithoutHash(url).href === locationUrl.href) {
            locationUrl.hash = url.hash
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
      }).catch(error => {
        if (!Axios.isCancel(error)) {
          const throwException = fireExceptionEvent(error)
          this.finishVisit(visit)
          if (throwException) {
            return Promise.reject(error)
          }
        }
      }), {
        get: function(target, prop) {
          if (['then', 'catch', 'finally'].includes(prop)) {
            console.warn('Inertia.js visit promises have been deprecated and will be removed in a future release. Please use the new visit event callbacks instead.\n\nLearn more at https://inertiajs.com/manual-visits#promise-deprecation')
          }
          return typeof target[prop] === 'function'
            ? target[prop].bind(target)
            : target[prop]
        },
      },
    )
  },

  setPage(page, { visitId = this.createVisitId(), replace = false, preserveScroll = false, preserveState = false } = {}) {
    return Promise.resolve(this.resolveComponent(page.component)).then(component => {
      if (visitId === this.visitId) {
        page.scrollRegions = page.scrollRegions || []
        page.rememberedState = page.rememberedState || {}
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
  },

  pushState(page) {
    this.page = page
    window.history.pushState(page, '', page.url)
  },

  replaceState(page) {
    this.page = page
    window.history.replaceState(page, '', page.url)
  },

  handlePopstateEvent(event) {
    if (event.state !== null) {
      const page = event.state
      let visitId = this.createVisitId()
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
  },

  get(url, data = {}, options = {}) {
    return this.visit(url, { ...options, method: 'get', data })
  },

  reload(options = {}) {
    return this.visit(window.location.href, { ...options, preserveScroll: true, preserveState: true })
  },

  replace(url, options = {}) {
    console.warn(`Inertia.replace() has been deprecated and will be removed in a future release. Please use Inertia.${options.method ?? 'get'}() instead.`)
    return this.visit(url, { preserveState: true, ...options, replace: true })
  },

  post(url, data = {}, options = {}) {
    return this.visit(url, { preserveState: true, ...options, method: 'post', data })
  },

  put(url, data = {}, options = {}) {
    return this.visit(url, { preserveState: true, ...options, method: 'put', data })
  },

  patch(url, data = {}, options = {}) {
    return this.visit(url, { preserveState: true, ...options, method: 'patch', data })
  },

  delete(url, options = {}) {
    return this.visit(url, { preserveState: true, ...options, method: 'delete' })
  },

  remember(data, key = 'default') {
    this.replaceState({
      ...this.page,
      rememberedState: {
        ...this.page.rememberedState,
        [key]: data,
      },
    })
  },

  restore(key = 'default') {
    return window.history.state?.rememberedState?.[key]
  },

  on(type, callback) {
    const listener = event => {
      const response = callback(event)
      if (event.cancelable && !event.defaultPrevented && response === false) {
        event.preventDefault()
      }
    }

    document.addEventListener(`inertia:${type}`, listener)
    return () => document.removeEventListener(`inertia:${type}`, listener)
  },
}
