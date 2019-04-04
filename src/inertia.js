import axios from 'axios'
import nprogress from 'nprogress'

export default {
  resolveComponent: null,
  cancelToken: null,
  progressBar: null,
  firstPage: null,
  modal: null,
  page: {
    component: null,
    props: null,
    instance: null,
  },

  init(component, props, resolveComponent) {
    this.resolveComponent = resolveComponent
    this.setPage(component, props).then(() => this.setScroll('restore'))

    window.history.scrollRestoration = 'manual'
    window.addEventListener('popstate', this.restore.bind(this))
    document.addEventListener('keydown', this.hideModalOnEscape.bind(this))
    document.addEventListener('scroll', this.saveScrollPosition.bind(this))
  },

  getHttp() {
    if (this.cancelToken) {
      this.cancelToken.cancel(this.cancelToken)
    }

    this.cancelToken = axios.CancelToken.source()

    return axios.create({
      cancelToken: this.cancelToken.token,
      headers: {
        'Accept': 'text/html, application/xhtml+xml',
        'X-Requested-With': 'XMLHttpRequest',
        'X-Inertia': true,
      },
    })
  },

  isInertiaResponse(response) {
    return response && response.headers['x-inertia']
  },

  showProgressBar() {
    this.progressBar = setTimeout(() => nprogress.start(), 250)
  },

  hideProgressBar() {
    nprogress.done()
    clearInterval(this.progressBar)
  },

  load(url) {
    this.hideModal()
    this.showProgressBar()

    return this.getHttp().get(url).then(response => {
      if (this.isInertiaResponse(response)) {
        return response.data
      } else {
        this.showModal(response.data)
      }
    }).catch(error => {
      if (axios.isCancel(error)) {
        return
      } else if (this.isInertiaResponse(error.response)) {
        return error.response.data
      } else if (error.response) {
        this.showModal(error.response.data)
      } else {
        return Promise.reject(error)
      }
    }).then(page => {
      this.hideProgressBar()
      return page
    })
  },

  setPage(component, props) {
    return Promise.resolve(this.resolveComponent(component)).then(instance => {
      this.firstPage = this.firstPage === null
      this.page.component = component
      this.page.props = props
      this.page.instance = instance
    })
  },

  setState(replace = false, url) {
    window.history[replace ? 'replaceState' : 'pushState']({ scrollPosition: this.getScrollPosition() }, '', url)
  },

  setScroll(action) {
    if (action === 'restore' && window.history.state) {
      window.scrollTo(window.history.state.scrollPosition.x, window.history.state.scrollPosition.y)
    } else if (action === 'top') {
      window.scrollTo(0, 0)
    }
  },

  first() {
    return this.firstPage
  },

  visit(url, { replace = false, preserveScroll = false } = {}) {
    return this.load(url).then(page => {
      if (page) {
        this.setState(replace, page.url)
        this.setPage(page.component, page.props)
          .then(() => this.setScroll(preserveScroll ? 'preserve' : 'top'))
      }
    })
  },

  replace(url, { preserveScroll = false } = {}) {
    return this.visit(url, { replace: true, preserveScroll })
  },

  restore() {
    this.load(window.location.href).then(page => {
      if (page) {
        this.setPage(page.component, page.props)
          .then(() => this.setScroll('restore'))
      }
    })
  },

  saveScrollPosition() {
    this.setState(true, window.location.pathname + window.location.search)
  },

  getScrollPosition() {
    return {
      x: window.pageXOffset,
      y: window.pageYOffset,
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
