import axios from 'axios'
import nprogress from 'nprogress'

export default {
  setPage: null,
  version: null,
  cancelToken: null,
  progressBar: null,
  modal: null,

  init(page, setPage) {
    this.version = page.version
    this.setPage = setPage

    if (window.history.state && this.navigationType() === 'back_forward') {
      this.setPage(window.history.state)
    } else {
      this.setPage(page)
      this.setState(
        true,
        window.location.pathname + window.location.search,
        page
      )
    }

    window.addEventListener('popstate', this.restoreState.bind(this))
    document.addEventListener('keydown', this.hideModalOnEscape.bind(this))
  },

  navigationType() {
    if (
      window.performance &&
      window.performance.getEntriesByType('navigation').length
    ) {
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

  visit(
    url,
    { method = 'get', data = {}, replace = false, preserveScroll = false } = {}
  ) {
    this.hideModal()
    this.showProgressBar()

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
        Accept: 'text/html, application/xhtml+xml',
        'X-Requested-With': 'XMLHttpRequest',
        'X-Inertia': true,
        ...(this.version ? { 'X-Inertia-Version': this.version } : {}),
      },
    })
      .then(response => {
        if (this.isInertiaResponse(response)) {
          return response.data
        } else {
          this.showModal(response.data)
        }
      })
      .catch(error => {
        if (axios.isCancel(error)) {
          return
        } else if (
          error.response.status === 409 &&
          error.response.headers['x-inertia-location']
        ) {
          return this.hardVisit(
            true,
            error.response.headers['x-inertia-location']
          )
        } else if (this.isInertiaResponse(error.response)) {
          return error.response.data
        } else if (error.response) {
          this.showModal(error.response.data)
        } else {
          return Promise.reject(error)
        }
      })
      .then(page => {
        if (page) {
          this.version = page.version
          this.setState(
            replace ||
              page.url === window.location.pathname + window.location.search,
            page.url,
            page
          )
          this.setPage(page).then(() => {
            this.setScroll(preserveScroll)
            this.hideProgressBar()
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

  setState(replace = false, url, page) {
    window.history[replace ? 'replaceState' : 'pushState'](
      {
        component: page.component,
        props: page.props,
      },
      '',
      url
    )
  },

  restoreState(event) {
    if (event.state) {
      this.setPage(event.state)
    }
  },

  replace(url, options = {}) {
    return this.visit(url, { replace: true, ...options })
  },

  post(url, data = {}, options = {}) {
    return this.visit(url, { method: 'post', data, ...options })
  },

  put(url, data = {}, options = {}) {
    return this.visit(url, { method: 'put', data, ...options })
  },

  patch(url, data = {}, options = {}) {
    return this.visit(url, { method: 'patch', data, ...options })
  },

  delete(url, options = {}) {
    return this.visit(url, { method: 'delete', ...options })
  },

  cache(key, props) {
    let page = window.history.state
    page.props = { ...page.props, [key]: props }
    this.setState(true, window.location.pathname + window.location.search, page)
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
