import axios from 'axios'
import nprogress from 'nprogress'

function getHttp() {
  return axios.create({
    headers: {
      'Accept': 'text/html, application/xhtml+xml',
      'X-Requested-With': 'XMLHttpRequest',
      'X-Inertia': true,
    },
  })
}

function visit(url, { replace, preserveScroll }, setPage) {
  let progress = setTimeout(() => nprogress.start(), 500)

  if (window.inertiaRequest) {
    window.inertiaRequest.cancel(window.inertiaRequest)
  }

  window.inertiaRequest = axios.CancelToken.source()

  getHttp().get(url, { cancelToken: window.inertiaRequest.token }).then(response => {
    if (response.headers['x-inertia']) {
      window.history[replace ? 'replaceState' : 'pushState'](null, null, response.data.url)
      setPage(response.data.component, response.data.props, preserveScroll)
    } else {
      showHtmlModal(response.data)
    }
  }).catch(error => {
    if (axios.isCancel(error)) {
      return
    } else if (error.response && error.response.headers['x-inertia']) {
      window.history[replace ? 'replaceState' : 'pushState'](null, null, error.response.data.url)
      setPage(error.response.data.component, error.response.data.props, preserveScroll)
    } else if (error.response) {
      showHtmlModal(error.response.data)
    } else {
      return Promise.reject(error)
    }
  }).then(() => {
    nprogress.done()
    clearInterval(progress)
  })
}

function showHtmlModal(html) {
  let page = document.createElement('html')
  page.innerHTML = html
  page.querySelectorAll('a').forEach(a => a.setAttribute('target', '_top'))

  let modal = document.createElement('div')
  modal.id = 'inertia-modal'
  modal.style.position = 'fixed'
  modal.style.width = '100vw'
  modal.style.height = '100vh'
  modal.style.padding = '50px'
  modal.style.backgroundColor = 'rgba(0, 0, 0, .6)'
  modal.style.zIndex = 200000
  modal.addEventListener('click', () => hideHtmlModal(modal))

  let iframe = document.createElement('iframe')
  iframe.style.backgroundColor = 'white'
  iframe.style.borderRadius = '5px'
  iframe.style.width = '100%'
  iframe.style.height = '100%'
  modal.appendChild(iframe)

  document.body.prepend(modal)
  document.body.style.overflow = 'hidden'
  iframe.contentWindow.document.open()
  iframe.contentWindow.document.write(page.outerHTML)
  iframe.contentWindow.document.close()
}

function hideHtmlModal(modal) {
  modal.outerHTML = ''
  document.body.style.overflow = 'visible'
}

function handlePopState(event, setPage) {
  let modal = document.getElementById('inertia-modal')

  if (modal) {
    hideHtmlModal(modal)
  }

  let progress = setTimeout(() => nprogress.start(), 250)

  if (window.inertiaRequest) {
    window.inertiaRequest.cancel(window.inertiaRequest)
  }

  window.inertiaRequest = axios.CancelToken.source()

  getHttp().get(window.location.href, { cancelToken: window.inertiaRequest.token }).then(response => {
    if (response.headers['x-inertia']) {
      setPage(response.data.component, response.data.props)
    } else {
      showHtmlModal(response.data)
    }
  }).catch(error => {
    if (axios.isCancel(error)) {
      return
    } else if (error.response && error.response.headers['x-inertia']) {
      setPage(error.response.data.component, error.response.data.props)
    } else if (error.response) {
      showHtmlModal(error.response.data)
    } else {
      return Promise.reject(error)
    }
  }).then(() => {
    nprogress.done()
    clearInterval(progress)
  })
}

function handleKeydown() {
  if (event.keyCode == 27) {
    let modal = document.getElementById('inertia-modal')
    if (modal) {
      hideHtmlModal(modal)
    }
  }
}

export default {
  resolveComponent: null,
  page: {
    first: null,
    component: null,
    props: null,
    instance: null,
  },
  init(component, props, resolveComponent) {
    this.resolveComponent = resolveComponent
    this.setPage(component, props)

    window.onpopstate = (event) => handlePopState(event, this.setPage.bind(this))
    document.onkeydown = (event) => handleKeydown(event)
  },
  setPage(component, props, preserveScroll) {
    Promise.resolve(this.resolveComponent(component)).then(instance => {
      this.page.first = this.page.first === null
      this.page.component = component
      this.page.props = props
      this.page.instance = instance

      if (!preserveScroll) {
        window.scrollTo(0, 0)
      }
    })
  },
  first() {
    return this.page.first
  },
  visit(url, { replace = false, preserveScroll = false } = {}) {
    visit(url, { replace, preserveScroll }, this.setPage.bind(this))
  },
  replace(url, { preserveScroll = false } = {}) {
    visit(url, { replace: true, preserveScroll }, this.setPage.bind(this))
  },
}
