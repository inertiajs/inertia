import axios from 'axios'
import nprogress from 'nprogress'

export default {
  resolveComponent: null,
  currentRequest: null,
  isFirstPage: null,
  progressBar: null,
  modal: null,
  page: {
    component: null,
    props: null,
    instance: null,
    cached: false,
  },

  init(component, props, resolveComponent) {
    this.resolveComponent = resolveComponent
    this.setPage(component, props)

    window.onpopstate = (event) => this.handlePopState(event)
    document.onkeydown = (event) => this.handleKeydown(event)
  },

  setPage(component, props, preserveScroll = false) {
    return Promise.resolve(this.resolveComponent(component)).then(instance => {
      this.isFirstPage = this.isFirstPage === null
      this.page.component = component
      this.page.props = props
      this.page.instance = instance

      if (!preserveScroll) {
        window.scrollTo(0, 0)
      }
    })
  },

  first() {
    return this.isFirstPage
  },

  getHttp() {
    if (this.currentRequest) {
      this.currentRequest.cancel(this.currentRequest)
    }

    this.currentRequest = axios.CancelToken.source()

    return axios.create({
      cancelToken: this.currentRequest.token,
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

  visit(url, { replace = false, preserveScroll = false } = {}) {
    this.hideModal()
    this.showProgressBar()

    return this.getHttp().get(url).then(response => {
      if (this.isInertiaResponse(response)) {
        this.setState(replace, response.data)
        return this.setPage(response.data.component, response.data.props, preserveScroll)
      } else {
        this.showModal(response.data)
      }
    }).catch(error => {
      if (axios.isCancel(error)) {
        return
      } else if (this.isInertiaResponse(error.response)) {
        this.setState(replace, error.response.data)
        return this.setPage(error.response.data.component, error.response.data.props, preserveScroll)
      } else if (error.response) {
        this.showModal(error.response.data)
      } else {
        return Promise.reject(error)
      }
    }).then(() => {
      this.clearProgressBar()
    })
  },

  replace(url, { preserveScroll = false } = {}) {
    this.visit(url, { replace: true, preserveScroll })
  },

  setState(replace, data) {
    if (replace === true) {
      window.history.replaceState(data, null, data.url)
    } else if (replace === false) {
      window.history.pushState(data, null, data.url)
    }
  },

  handlePopState(event) {
    if (event.state) {
      this.page.cached = true
      this.setPage(event.state.component, event.state.props, true).then(() => {
        return this.visit(window.location.href, { replace: null, preserveScroll: true })
      }).then(() => this.page.cached = false)
    }
  },

  showProgressBar() {
    this.progressBar = setTimeout(() => nprogress.start(), 250)
  },

  clearProgressBar() {
    nprogress.done()
    clearInterval(this.progressBar)
  },

  handleKeydown(event) {
    if (this.modal && event.keyCode == 27) {
      this.hideModal()
    }
  },

  hideModal() {
    if (this.modal) {
      this.modal.outerHTML = ''
      this.modal = null
      document.body.style.overflow = 'visible'
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
    this.modal.addEventListener('click', this.hideModal)

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
}
