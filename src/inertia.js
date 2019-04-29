import axios from 'axios'
import nprogress from 'nprogress'

export default {
  setPage: null,
  version: null,
  cancelToken: null,
  progressBar: null,
  modal: null,

  init(page, setPage, beforeVisit = null, afterVisit = null) {
    this.version = page.version
    this.setPage = setPage

    if (window.history.state && this.navigationType() === 'back_forward') {
      this.setPage(window.history.state)
    } else {
      this.setPage(page)
      this.setState(page)
    }

    if(beforeVisit && afterVisit) {
      this.beforeVisit = beforeVisit
      this.afterVisit = afterVisit
    }

    window.addEventListener('popstate', this.restoreState.bind(this))
    document.addEventListener('keydown', this.hideModalOnEscape.bind(this))
  },

  navigationType() {
    if (window.performance && window.performance.getEntriesByType('navigation').length) {
      return window.performance.getEntriesByType('navigation')[0].type
    }
  },

  isInertiaResponse(response) {
    return response && response.headers['x-inertia']
  },

  showProgressBar() {
    this.progressBar = setTimeout(() => nprogress.start(), 100)
  },

  hideProgressBar() {
    nprogress.done()
    clearInterval(this.progressBar)
  },

  beforeVisit() {
    this.showProgressBar()
  },

  afterVisit() {
    this.hideProgressBar()
  },

  visit(url, { method = 'get', data = {}, replace = false, preserveScroll = false } = {}) {
    this.hideModal()
    this.beforeVisit()

    if (this.cancelToken) {
      this.cancelToken.cancel(this.cancelToken)
    }

    this.cancelToken = axios.CancelToken.source()

    return axios({
      method: method,
      url: url,
      data: data,
      cancelToken: this.cancelToken.token,
      headers: {
        'Accept': 'text/html, application/xhtml+xml',
        'X-Requested-With': 'XMLHttpRequest',
        'X-Inertia': true,
        ...this.version ? { 'X-Inertia-Version': this.version } : {},
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
        return this.hardVisit(true, error.response.headers['x-inertia-location'])
      } else if (this.isInertiaResponse(error.response)) {
        return error.response.data
      } else if (error.response) {
        this.showModal(error.response.data)
      } else {
        return Promise.reject(error)
      }
    }).then(page => {
      if (page) {
        this.version = page.version
        this.setState(page, replace)
        this.setPage(page).then(() => {
          this.setScroll(preserveScroll)
          this.afterVisit()
        })
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

  setScroll(preserveScroll) {
    if (!preserveScroll) {
      window.scrollTo(0, 0)
    }
  },

  setState(page, replace = false) {
    replace = replace || page.url === window.location.pathname + window.location.search
    window.history[replace ? 'replaceState' : 'pushState'](page, '', page.url)
  },

  restoreState(event) {
    if (event.state) {
      this.setPage(event.state)
    }
  },

  replace(url, options = {}) {
    return this.visit(url, { ...options, replace: true })
  },

  reload(url, options = {}) {
    return this.replace(window.location.href, options)
  },

  post(url, data = {}, options = {}) {
    return this.visit(url, { ...options, method: 'post', data })
  },

  put(url, data = {}, options = {}) {
    return this.visit(url, { ...options, method: 'put', data })
  },

  patch(url, data = {}, options = {}) {
    return this.visit(url, { ...options, method: 'patch', data })
  },

  delete(url, options = {}) {
    return this.visit(url, { ...options, method: 'delete' })
  },

  remember(data, key = 'default') {
    this.setState({
      ...window.history.state,
      cache: { ...window.history.state.cache, [key]: data }
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
