import Axios from 'axios'
import Modal from './modal'
import Progress from './progress'

export default {
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

    window.addEventListener('popstate', this.restoreState.bind(this))
  },

  navigationType() {
    if (window.performance && window.performance.getEntriesByType('navigation').length) {
      return window.performance.getEntriesByType('navigation')[0].type
    }
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

  visit(url, { method = 'get', data = {}, replace = false, preserveScroll = false, preserveState = false, only = [] } = {}) {
    Progress.start()
    this.cancelActiveVisits()
    let visitId = this.createVisitId()

    return Axios({
      method,
      url: url.toString(),
      data: method.toLowerCase() === 'get' ? {} : data,
      params: method.toLowerCase() === 'get' ? data : {},
      cancelToken: this.cancelToken.token,
      headers: {
        Accept: 'text/html, application/xhtml+xml',
        'X-Requested-With': 'XMLHttpRequest',
        'X-Inertia': true,
        ...(only.length ? {
          'X-Inertia-Partial-Component': this.page.component,
          'X-Inertia-Partial-Data': only.join(','),
        } : {}),
        ...(this.version ? { 'X-Inertia-Version': this.version } : {}),
      },
    }).then(response => {
      if (this.isInertiaResponse(response)) {
        return response.data
      } else {
        Modal.show(response.data)
      }
    }).catch(error => {
      if (Axios.isCancel(error)) {
        return
      } else if (error.response.status === 409 && error.response.headers['x-inertia-location']) {
        Progress.stop()
        return this.hardVisit(true, error.response.headers['x-inertia-location'])
      } else if (this.isInertiaResponse(error.response)) {
        return error.response.data
      } else if (error.response) {
        Progress.stop()
        Modal.show(error.response.data)
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
    Progress.increment()
    return Promise.resolve(this.resolveComponent(page.component)).then(component => {
      if (visitId === this.visitId) {
        preserveState = typeof preserveState === 'function' ? preserveState(page.props) : preserveState
        preserveScroll = typeof preserveScroll === 'function' ? preserveScroll(page.props) : preserveScroll
        
        this.version = page.version
        this.setState(page, replace, preserveState)
        this.updatePage(component, page.props, { preserveState })
        this.setScroll(preserveScroll)
        Progress.stop()
      }
    })
  },

  setScroll(preserveScroll) {
    if (!preserveScroll) {
      document.querySelectorAll('html,body,[scroll-region]')
        .forEach(region => region.scrollTo(0, 0))
    }
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
      this.setPage(event.state)
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
