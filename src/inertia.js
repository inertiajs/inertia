import axios from 'axios'
import nprogress from 'nprogress'

export default {
  resolveComponent: null,
  updatePage: null,
  version: null,
  visitId: null,
  cancelToken: null,
  progressBar: null,
  modal: null,

  init({ initialPage, resolveComponent, updatePage }) {
    this.resolveComponent = resolveComponent
    this.updatePage = updatePage

    if (window.history.state && this.navigationType() === 'back_forward') {
      this.setPage(window.history.state)
    } else {
      this.setPage(initialPage)
    }

    window.addEventListener('popstate', this.restoreState.bind(this))
    document.addEventListener('keydown', this.hideModalOnEscape.bind(this))

    this.initProgressBar()
  },

  navigationType() {
    if (window.performance && window.performance.getEntriesByType('navigation').length) {
      return window.performance.getEntriesByType('navigation')[0].type
    }
  },

  isInertiaResponse(response) {
    return response && response.headers['x-inertia']
  },

  initProgressBar() {
    nprogress.configure({ showSpinner: false })
  },

  startProgressBar() {
    nprogress.set(0)
    nprogress.start()
  },

  incrementProgressBar() {
    nprogress.inc(0.4)
  },

  stopProgressBar() {
    nprogress.done()
  },

  cancelActiveVisits() {
    if (this.cancelToken) {
      this.cancelToken.cancel(this.cancelToken)
    }

    this.cancelToken = axios.CancelToken.source()
  },

  createVisitId() {
    this.visitId = {}
    return this.visitId
  },

  visit(url, { method = 'get', data = {}, replace = false, preserveScroll = false, preserveState = false } = {}) {
    this.startProgressBar()
    this.cancelActiveVisits()
    let visitId = this.createVisitId()

    return axios({
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
        this.showModal(response.data)
      }
    }).catch(error => {
      if (axios.isCancel(error)) {
        return
      } else if (error.response.status === 409 && error.response.headers['x-inertia-location']) {
        this.stopProgressBar()
        return this.hardVisit(true, error.response.headers['x-inertia-location'])
      } else if (this.isInertiaResponse(error.response)) {
        return error.response.data
      } else if (error.response) {
        this.stopProgressBar()
        this.showModal(error.response.data)
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
    this.incrementProgressBar()
    return this.resolveComponent(page.component).then(component => {
      if (visitId === this.visitId) {
        this.version = page.version
        this.setState(page, replace, preserveState)
        this.updatePage(component, page.props, { preserveState })
        this.setScroll(preserveScroll)
        this.stopProgressBar()
      }
    })
  },

  setScroll(preserveScroll) {
    if (!preserveScroll) {
      window.scrollTo(0, 0)
    }
  },

  setState(page, replace = false, preserveState = false) {
    replace = replace
      || page.url === window.location.href
      || (window.location.pathname === '/' && page.url === window.location.href.replace(/\/$/, ''))

    if (replace) {
      window.history.replaceState({
        ...(preserveState && window.history.state) ? { cache: window.history.state.cache } : {},
        ...page
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

  showModal(html) {
    let page = document.createElement('html')
    page.innerHTML = html
    page.querySelectorAll('a').forEach(a => a.setAttribute('target', '_top'))

    this.modal = document.createElement('div')
    this.modal.style.position = 'fixed'
    this.modal.style.width = '100vw'
    this.modal.style.height = '100vh'
    this.modal.style.padding = '50px'
    this.modal.style.backgroundColor = 'rgba(0, 0, 0, .6)'
    this.modal.style.zIndex = 200000
    this.modal.addEventListener('click', () => this.hideModal())

    let iframe = document.createElement('iframe')
    iframe.style.backgroundColor = 'white'
    iframe.style.borderRadius = '5px'
    iframe.style.width = '100%'
    iframe.style.height = '100%'
    this.modal.appendChild(iframe)

    document.body.prepend(this.modal)
    document.body.style.overflow = 'hidden'
    iframe.contentWindow.document.open()
    iframe.contentWindow.document.write(page.outerHTML)
    iframe.contentWindow.document.close()
  },

  hideModal() {
    if (this.modal) {
      this.modal.outerHTML = ''
      this.modal = null
      document.body.style.overflow = 'visible'
    }
  },

  hideModalOnEscape(event) {
    if (this.modal && event.keyCode == 27) {
      this.hideModal()
    }
  },
}
