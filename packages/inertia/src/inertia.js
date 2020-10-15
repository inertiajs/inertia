import Axios from 'axios'
import debounce from './debounce'
import modal from './modal'

export default {
  resolveComponent: null,
  swapComponent: null,
  transformProps: null,
  cancelToken: null,
  visitId: null,
  page: null,

  init({ initialPage, resolveComponent, swapComponent, transformProps }) {
    this.resolveComponent = resolveComponent
    this.swapComponent = swapComponent
    this.transformProps = transformProps
    this.handleInitialPageVisit(initialPage)
    this.setupEventListeners()
  },

  handleInitialPageVisit(page) {
    if (this.isBackForwardVisit()) {
      this.handleBackForwardVisit()
    } else if (this.isLocationVisit()) {
      this.handleLocationVisit(page)
    } else {
      page.url += window.location.hash
      this.setPage(page)
    }
    this.fireEvent('navigate', { detail: { page: page } })
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
      const el = document.getElementById(window.location.hash.slice(1))
      if (el) {
        el.scrollIntoView()
      }
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

  handleBackForwardVisit() {
    this.setPage(window.history.state, { preserveScroll: true }).then(() => {
      this.restoreScrollPositions()
    })
  },

  locationVisit(url, preserveScroll) {
    try {
      window.sessionStorage.setItem('inertiaLocationVisit', JSON.stringify({ preserveScroll }))
      window.location.href = url
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
    page.rememberedState = window.history.state ? window.history.state.rememberedState : {}
    page.scrollRegions = window.history.state ? window.history.state.scrollRegions : []
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
    return response && response.headers['x-inertia']
  },

  cancelActiveVisits() {
    if (this.cancelToken) {
      this.cancelToken.cancel()
    }
    this.cancelToken = Axios.CancelToken.source()
  },

  createVisitId() {
    this.visitId = {}
    return this.visitId
  },

  normalizeUrl(url) {
    url = url.toString()
    try {
      return new URL(url)
    } catch (error) {
      return new URL(`${window.location.origin}${url}`)
    }
  },

  urlWithoutHash(url) {
    return url.href.split('#')[0]
  },

  visit(url, {
    method = 'get',
    data = {},
    replace = false,
    preserveScroll = false,
    preserveState = false,
    only = [],
    headers = {},
    onCancelToken = () => ({}),
    onStart = () => ({}),
    onProgress = () => ({}),
    onFinish = () => ({}),
    onCancel = () => ({}),
    onSuccess = () => ({}),
  } = {}) {
    url = this.normalizeUrl(url)
    let visit = { url, ...arguments[1] }
    if (onStart(visit) === false || !this.fireEvent('start', { cancelable: true, detail: { visit } } )) {
      return
    }
    this.cancelActiveVisits()
    this.saveScrollPositions()
    let visitId = this.createVisitId()
    onCancelToken(this.cancelToken)

    return new Proxy(
      Axios({
        method,
        url: this.urlWithoutHash(url),
        data: method.toLowerCase() === 'get' ? {} : data,
        params: method.toLowerCase() === 'get' ? data : {},
        cancelToken: this.cancelToken.token,
        headers: {
          ...headers,
          Accept: 'text/html, application/xhtml+xml',
          'X-Requested-With': 'XMLHttpRequest',
          'X-Inertia': true,
          ...(only.length ? {
            'X-Inertia-Partial-Component': this.page.component,
            'X-Inertia-Partial-Data': only.join(','),
          } : {}),
          ...(this.page.version ? { 'X-Inertia-Version': this.page.version } : {}),
        },
        onUploadProgress: progress => {
          progress.percentage = Math.round(progress.loaded / progress.total * 100)
          this.fireEvent('progress', { detail: { progress } })
          onProgress(progress)
        },
      }).then(response => {
        if (!this.isInertiaResponse(response)) {
          return Promise.reject({ response })
        }
        if (only.length && response.data.component === this.page.component) {
          response.data.props = { ...this.page.props, ...response.data.props }
        }
        if (url.hash && this.urlWithoutHash(url) === this.normalizeUrl(response.data.url).href) {
          response.data.url = `${response.data.url}${url.hash}`
        }
        return this.setPage(response.data, { visitId, replace, preserveScroll, preserveState })
      }).then(() => {
        this.fireEvent('success', { detail: { page: this.page } })
        return onSuccess(this.page)
      }).catch(error => {
        if (this.isInertiaResponse(error.response)) {
          return this.setPage(error.response.data, { visitId })
        } else if (Axios.isCancel(error)) {
          onCancel()
        } else if (this.isLocationVisitResponse(error.response)) {
          let locationUrl = this.normalizeUrl(error.response.headers['x-inertia-location'])
          if (url.hash && this.urlWithoutHash(url) === this.urlWithoutHash(locationUrl)) {
            locationUrl.hash = url.hash
          }
          this.locationVisit(locationUrl.href, preserveScroll)
        } else if (error.response) {
          if (this.fireEvent('invalid', { cancelable: true, detail: { response: error.response } })) {
            modal.show(error.response.data)
          }
        } else {
          return Promise.reject(error)
        }
      }).catch(error => {
        if (this.fireEvent('error', { cancelable: true, detail: { error } })) {
          return Promise.reject(error)
        }
      }).finally(() => {
        this.fireEvent('finish')
        onFinish()
      }), {
        get: function(target, prop) {
          console.warn('Inertia.js visit promises have been deprecated and will be removed in a future release. Please use the new visit event callbacks instead.\n\nLearn more at https://inertiajs.com/manual-visits#promise-deprecation')
          return target[prop].bind(target)
        },
      },
    )
  },

  setPage(page, { visitId = this.createVisitId(), replace = false, preserveScroll = false, preserveState = false } = {}) {
    return Promise.resolve(this.resolveComponent(page.component)).then(component => {
      if (visitId === this.visitId) {
        page.props = this.transformProps(page.props)
        page.scrollRegions = page.scrollRegions || []
        page.rememberedState = page.rememberedState || {}
        preserveState = typeof preserveState === 'function' ? preserveState(page) : preserveState
        preserveScroll = typeof preserveScroll === 'function' ? preserveScroll(page) : preserveScroll
        replace = replace || this.normalizeUrl(page.url).href === window.location.href
        replace ? this.replaceState(page) : this.pushState(page)
        this.swapComponent({ component, page, preserveState }).then(() => {
          if (!preserveScroll) {
            this.resetScrollPositions()
          }
          if (!replace) {
            this.fireEvent('navigate', { detail: { page: page } })
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
      let page = event.state
      let visitId = this.createVisitId()
      return Promise.resolve(this.resolveComponent(page.component)).then(component => {
        if (visitId === this.visitId) {
          this.page = page
          this.swapComponent({ component, page, preserveState: false }).then(() => {
            this.restoreScrollPositions()
            this.fireEvent('navigate', { detail: { page: page } })
          })
        }
      })
    } else {
      let url = this.normalizeUrl(this.page.url)
      url.hash = window.location.hash
      this.replaceState({ ...this.page, url: url.href })
      this.resetScrollPositions()
    }
  },

  get(url, data = {}, options = {}) {
    return this.visit(url, { ...options, method: 'get', data })
  },

  reload(options = {}) {
    return this.replace(window.location.href, options)
  },

  replace(url, options = {}) {
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
    let page = { ...this.page }
    page.rememberedState[key] = data
    this.replaceState(page)
  },

  restore(key = 'default') {
    if (window.history.state.rememberedState && window.history.state.rememberedState[key]) {
      return window.history.state.rememberedState[key]
    }
  },

  fireEvent(name, options) {
    return document.dispatchEvent(
      new CustomEvent(`inertia:${name}`, options),
    )
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
