import Nprogress from 'nprogress'

Nprogress.configure({ showSpinner: false })

export default {
  delay: null,
  loading: false,

  start() {
    clearTimeout(this.delay)

    this.delay = setTimeout(() => {
      this.loading = true
      Nprogress.set(0)
      Nprogress.start()
    }, 250)
  },

  increment() {
    if (this.loading) {
      Nprogress.inc(0.4)
    }
  },

  stop() {
    clearTimeout(this.delay)

    if (this.loading) {
      Nprogress.done()
      this.loading = false
    }
  },
}
