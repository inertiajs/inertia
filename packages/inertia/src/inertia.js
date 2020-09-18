import Axios from 'axios'
import debounce from './debounce'
import modal from './modal'
import progress from './progress'
import preloader from './preloader'

export default {
  saveScrollPositions: null,
  resolveComponent: null,
  updatePage: null,
  version: null,
  visitId: null,
  cancelToken: null,
  page: null,

  init({ initialPage, resolveComponent, updatePage }) {
    this.resolveComponent = resolveComponent
    this.updatePage = updatePage

    if (window.history.state && this.navigationType() === 'back_forward') {
      this.setPage(window.history.state)
    } else if (window.sessionStorage.getItem('inertia.hardVisit')) {
      window.sessionStorage.removeItem('inertia.hardVisit')
      this.setPage(initialPage, { preserveState: true })
    } else {
      initialPage.url += window.location.hash
      this.setPage(initialPage)
    }

    this.saveScrollPositions = debounce(() => {
      this.setState({
        ...window.history.state,
        scrollRegions: Array.prototype.slice.call(this.scrollRegions()).map(region => {
          return {
            top: region.scrollTop,
            left: region.scrollLeft,
          }
        }),
      })
    }, 100)

    window.addEventListener('popstate', this.restoreState.bind(this))
  },

  navigationType() {
    if (window.performance && window.performance.getEntriesByType('navigation').length) {
      return window.performance.getEntriesByType('navigation')[0].type
    }
  },

  scrollRegions() {
    return document.querySelectorAll('[scroll-region]')
  },

  isInertiaResponse(response) {
    return response && response.headers['x-inertia']
  },

  cancelActiveVisits() {
    if (this.cancelToken) {
      this.cancelToken.cancel(this.cancelToken)
    }

    this.cancelToken = Axios.CancelToken.source()
  },

  createVisitId() {
    this.visitId = {}
    return this.visitId
  },

  inertiaRequest(url, cancelToken, { method = 'get', data = {}, only = [], headers = {} }) {
    return Axios({
      method,
      url: url.toString(),
      data: method.toLowerCase() === 'get' ? {} : data,
      params: method.toLowerCase() === 'get' ? data : {},
      cancelToken: cancelToken.token,
      headers: {
        ...headers,
        Accept: 'text/html, application/xhtml+xml',
        'X-Requested-With': 'XMLHttpRequest',
        'X-Inertia': true,
        ...(only.length ? {
          'X-Inertia-Partial-Component': this.page.component,
          'X-Inertia-Partial-Data': only.join(','),
        } : {}),
        ...(this.version ? { 'X-Inertia-Version': this.version } : {}),
      },
    })
  },

  preload(url, { method = 'get', data = {}, only = [], headers = {} }) {
    if (method.toLowerCase() !== 'get') {
      return
    }

    return preloader.load(
      url.toString(),
      cancelToken => this.inertiaRequest(url, cancelToken, { method, data, only, headers }),
    )
  },

  visit(url, { method = 'get', data = {}, replace = false, preserveScroll = false, preserveState = false, only = [], headers = {}} = {}) {
    progress.start()
    this.cancelActiveVisits()
    this.saveScrollPositions()
    let visitId = this.createVisitId()

    return (() => {
      if (method.toLowerCase() === 'get') {
        // When the request is a GET request, let's take it over from the preloader.
        const preloadRequest = this.preload(url, { method, data, only, headers })
        this.cancelToken = preloadRequest.cancelToken
        return preloadRequest.request
      }

      return this.inertiaRequest(url, this.cancelToken, { method, data, only, headers })
    })().then(response => {
      if (this.isInertiaResponse(response)) {
        return response.data
      } else {
        modal.show(response.data)
      }
    }).catch(error => {
      if (Axios.isCancel(error)) {
        return
      } else if (error.response.status === 409 && error.response.headers['x-inertia-location']) {
        progress.stop()
        return this.hardVisit(true, error.response.headers['x-inertia-location'])
      } else if (this.isInertiaResponse(error.response)) {
        return error.response.data
      } else if (error.response) {
        progress.stop()
        modal.show(error.response.data)
      } else {
        return Promise.reject(error)
      }
    }).then(page => {
      if (page) {
        if (only.length) {
          page.props = { ...this.page.props, ...page.props }
        }

        return this.setPage(page, { visitId, replace, preserveScroll, preserveState })
      }
    })
  },

  hardVisit(replace, url) {
    window.sessionStorage.setItem('inertia.hardVisit', true)

    if (replace) {
      window.location.replace(url)
    } else {
      window.location.href = url
    }
  },

  setPage(page, { visitId = this.createVisitId(), replace = false, preserveScroll = false, preserveState = false } = {}) {
    this.page = page
    progress.increment()
    return Promise.resolve(this.resolveComponent(page.component)).then(component => {
      if (visitId === this.visitId) {
        this.version = page.version
        this.setState(page, replace, preserveState)
        this.updatePage(component, page.props, { preserveState }).then(() => {
          let scrollRegions = this.scrollRegions()

          scrollRegions.forEach(region => {
            region.addEventListener('scroll', this.saveScrollPositions)
          })

          if (!preserveScroll) {
            document.documentElement.scrollTop = 0
            document.documentElement.scrollLeft = 0
            scrollRegions.forEach(region => {
              region.scrollTop = 0
              region.scrollLeft = 0
            })
          }

          this.saveScrollPositions()
        })
        preloader.flush()
        progress.stop()
      }
    })
  },

  setState(page, replace = false, preserveState = false) {
    if (replace || page.url === `${window.location.pathname}${window.location.search}`) {
      window.history.replaceState({
        ...{ cache: preserveState && window.history.state ? window.history.state.cache : {} },
        ...page,
      }, '', page.url)
    } else {
      window.history.pushState({
        cache: {},
        ...page,
      }, '', page.url)
    }
  },

  restoreState(event) {
    if (event.state) {
      progress.start()
      this.page = event.state
      let visitId = this.createVisitId()
      return Promise.resolve(this.resolveComponent(this.page.component)).then(component => {
        if (visitId === this.visitId) {
          this.version = this.page.version
          this.setState(this.page)
          this.updatePage(component, this.page.props, { preserveState: false }).then(() => {
            if (this.page.scrollRegions) {
              this.scrollRegions().forEach((region, index) => {
                region.scrollTop = this.page.scrollRegions[index].top
                region.scrollLeft = this.page.scrollRegions[index].left
              })
            }
          })
          preloader.flush()
          progress.stop()
        }
      })
    }
  },

  replace(url, options = {}) {
    return this.visit(url, { preserveState: true, ...options, replace: true })
  },

  reload(options = {}) {
    return this.replace(window.location.href, options)
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
    return this.visit(url, { ...options, method: 'delete' })
  },

  remember(data, key = 'default') {
    let newState = { ...window.history.state }
    newState.cache = newState.cache || {}
    newState.cache[key] = data
    this.setState(newState)
  },

  restore(key = 'default') {
    if (window.history.state.cache && window.history.state.cache[key]) {
      return window.history.state.cache[key]
    }
  },
}
