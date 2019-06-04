import Nanobar from 'nanobar'

const nanobar = new Nanobar()

export default {
  delay: null,
  loading: false,

  start() {
    clearTimeout(this.delay)

    this.delay = setTimeout(() => {
      this.loading = true
      nanobar.go(10)
    }, 250)
  },

  increment() {
    if (this.loading) {
      nanobar.go(50)
    }
  },

  stop() {
    clearTimeout(this.delay)

    if (this.loading) {
      nanobar.go(100)
      this.loading = false
    }
  },
}
