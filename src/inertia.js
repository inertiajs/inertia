import nprogress from 'nprogress'

export default {
  setPage: null,
  version: null,
  abortController: null,
  progressBar: null,
  modal: null,

  init(page, setPage) {
    this.version = page.version
    this.setPage = setPage

    if (window.history.state && this.navigationType() === 'back_forward') {
      this.setPage(window.history.state)
    } else {
      this.setPage(page)
      this.setState(page)
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
    return response && response.headers.has('x-inertia')
  },

  hasBody(method) {
    return ['GET', 'HEAD'].indexOf(method.toUpperCase()) === -1
  },

  getCookieValue(name) {
    let match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'))
    return match ? decodeURIComponent(match[3]) : null
  },

  showProgressBar() {
    this.progressBar = setTimeout(() => nprogress.start(), 100)
  },

  hideProgressBar() {
    nprogress.done()
    clearTimeout(this.progressBar)
  },

  visit(url, { method = 'get', data = {}, replace = false, preserveScroll = false } = {}) {
    this.hideModal()
    this.showProgressBar()

    if (this.abortController) {
      this.abortController.abort()
    }

    this.abortController = new AbortController()

    return window.fetch(url, {
      method: method,
      ...this.hasBody(method) ? { body: JSON.stringify(data) } : {},
      signal: this.abortController.signal,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'Accept': 'text/html, application/xhtml+xml',
        'X-Requested-With': 'XMLHttpRequest',
        'X-Inertia': true,
        'X-Xsrf-Token': this.getCookieValue('XSRF-TOKEN'),
        ...this.version ? { 'X-Inertia-Version': this.version } : {},
      },
    }).then(response => {
      if (response.status === 409 && response.headers.has('x-inertia-location')) {
        return this.hardVisit(true, response.headers.get('x-inertia-location'))
      } else if (this.isInertiaResponse(response)) {
        return response.json()
      } else {
        response.text().then(data => this.showModal(data))
      }
    }).catch(error => {
      if (error.name === 'AbortError') {
        return
      } else {
        return Promise.reject(error)
      }
    }).then(page => {
      if (page) {
        this.version = page.version
        this.setState(page, replace)
        return this.setPage(page).then(() => {
          this.setScroll(preserveScroll)
          this.hideProgressBar()
        })
      } else {
        this.hideProgressBar()
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
    replace = replace
      || page.url === window.location.href
      || (window.location.pathname === '/' && page.url === window.location.href.replace(/\/$/, ''))

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

  reload(options = {}) {
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
