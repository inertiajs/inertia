import Axios from 'axios'
import Modal from './modal'
import Progress from './progress'

export default {
  resolveComponent: null,
  updatePage: null,
  version: null,
  visitId: null,
  cancelToken: null,

  init({ initialPage, resolveComponent, updatePage }) {
    this.resolveComponent = resolveComponent
    this.updatePage = updatePage

    if (window.history.state && this.navigationType() === 'back_forward') {
      this.setPage(window.history.state)
    } else {
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

  visit(url, { method = 'get', data = {}, replace = false, preserveScroll = false, preserveState = false } = {}) {
    Progress.start()
    this.cancelActiveVisits()
    let visitId = this.createVisitId()

    return Axios({
      method,
      url,
      data: method.toLowerCase() === 'get' ? {} : data,
      params: method.toLowerCase() === 'get' ? data : {},
      cancelToken: this.cancelToken.token,
      headers: {
        Accept: 'text/html, application/xhtml+xml',
        'X-Requested-With': 'XMLHttpRequest',
        'X-Inertia': true,
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
        this.setPage(page, visitId, replace, preserveScroll, preserveState)
      }
    })
  },

  hardVisit(replace, url) {
    if (replace) {
      window.location.replace(url)
    } else {
      window.location.href = url
    }
  },

  setPage(page, visitId = this.createVisitId(), replace = false, preserveScroll = false, preserveState = false) {
    Progress.increment()
    return Promise.resolve(this.resolveComponent(page.component)).then(component => {
      if (visitId === this.visitId) {
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
      window.scrollTo(0, 0)
    }
  },

  setState(page, replace = false, preserveState = false) {
    if (replace || page.url === `${window.location.pathname}${window.location.search}`) {
      window.history.replaceState({
        ...((preserveState && window.history.state) ? { cache: window.history.state.cache } : {}),
        ...page,
      }, '', page.url)
    } else {
      window.history.pushState(page, '', page.url)
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
    this.setState({
      ...window.history.state,
      cache: { ...window.history.state.cache, [key]: data },
    })
  },

  restore(key = 'default') {
    if (window.history.state.cache && window.history.state.cache[key]) {
      return window.history.state.cache[key]
    }
  },
}
