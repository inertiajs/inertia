import Axios from 'axios'
import debounce from './debounce'
import modal from './modal'

export default {
  resolveComponent: null,
  updatePage: null,
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

    this.fireEvent('navigate', { detail: { page: initialPage } })

    window.addEventListener('popstate', this.restoreState.bind(this))
    document.addEventListener('scroll', debounce(this.handleScrollEvent.bind(this), 100), true)
  },

  scrollRegions() {
    return document.querySelectorAll('[scroll-region]')
  },

  handleScrollEvent(event) {
    if (event.target.hasAttribute('scroll-region')) {
      this.saveScrollPositions()
    }
  },

  saveScrollPositions() {
    this.setState({
      ...window.history.state,
      scrollRegions: Array.prototype.slice.call(this.scrollRegions()).map(region => {
        return {
          top: region.scrollTop,
          left: region.scrollLeft,
        }
      }),
    }, true)
  },

  resetScrollPositions() {
    document.documentElement.scrollTop = 0
    document.documentElement.scrollLeft = 0
    this.scrollRegions().forEach(region => {
      region.scrollTop = 0
      region.scrollLeft = 0
    })
  },

  restoreScrollPositions(page) {
    if (page.scrollRegions) {
      this.scrollRegions().forEach((region, index) => {
        region.scrollTop = page.scrollRegions[index].top
        region.scrollLeft = page.scrollRegions[index].left
      })
    }
  },

  navigationType() {
    if (window.performance && window.performance.getEntriesByType('navigation').length) {
      return window.performance.getEntriesByType('navigation')[0].type
    }
  },

  isInertiaResponse(response) {
    return response && response.headers['x-inertia']
  },

  isHardVisit(response) {
    return response && response.status === 409 && response.headers['x-inertia-location']
  },

  fireEvent(name, options) {
    return document.dispatchEvent(
      new CustomEvent(`inertia:${name}`, options),
    )
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

  visit(url, { method = 'get', data = {}, replace = false, preserveScroll = false, preserveState = false, only = [], headers = {} } = {}) {
    if (!this.fireEvent('start', { cancelable: true, detail: { url, ...arguments[1] } } )) {
      return Promise.reject()
    }

    this.cancelActiveVisits()
    this.saveScrollPositions()
    let visitId = this.createVisitId()

    return Axios({
      method,
      url: url.toString(),
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
    }).catch(error => {
      if (Axios.isCancel(error)) {
        return
      } else if(this.isInertiaResponse(error.response)) {
        return error.response
      }

      return Promise.reject(error)
    }).then(response => {
      if (!this.isInertiaResponse(response)) {
        return Promise.reject({ response })
      }
      if (!this.fireEvent('success', { cancelable: true, detail: { response } })) {
        return
      }
      return response.data
    }).catch(error => {
      if (this.isHardVisit(error.response)) {
        this.hardVisit(error.response.headers['x-inertia-location'])
      } else if (error.response) {
        if (this.fireEvent('invalid', { cancelable: true, detail: { error } })) {
          modal.show(error.response.data)
        }
      } else {
        if (this.fireEvent('error', { cancelable: true, detail: { error } })) {
          return Promise.reject(error)
        }
      }
    }).finally(() => {
      this.fireEvent('finish')
    }).then(page => {
      if (page) {
        if (only.length) {
          page.props = { ...this.page.props, ...page.props }
        }

        return this.setPage(page, { visitId, replace, preserveScroll, preserveState })
      }
    })
  },

  hardVisit(url) {
    window.sessionStorage.setItem('inertia.hardVisit', true)
    window.location.href = url
  },

  setPage(page, { visitId = this.createVisitId(), replace = false, preserveScroll = false, preserveState = false } = {}) {
    this.page = page
    replace = replace || page.url === `${window.location.pathname}${window.location.search}`
    return Promise.resolve(this.resolveComponent(page.component)).then(component => {
      if (visitId === this.visitId) {
        this.setState(page, replace, preserveState)
        this.updatePage(component, page.props, { preserveState }).then(() => {
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

  setState(page, replace = false, preserveState = false) {
    if (replace) {
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
      this.page = event.state
      let visitId = this.createVisitId()
      return Promise.resolve(this.resolveComponent(this.page.component)).then(component => {
        if (visitId === this.visitId) {
          this.updatePage(component, this.page.props, { preserveState: false }).then(() => {
            this.restoreScrollPositions(this.page)
            this.fireEvent('navigate', { detail: { page: this.page } })
          })
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
    this.setState(newState, true)
  },

  restore(key = 'default') {
    if (window.history.state.cache && window.history.state.cache[key]) {
      return window.history.state.cache[key]
    }
  },

  on(type, callback) {
    document.addEventListener(`inertia:${type}`, callback)
    return () => {
      document.removeEventListener(`inertia:${type}`, callback)
    }
  },
}
