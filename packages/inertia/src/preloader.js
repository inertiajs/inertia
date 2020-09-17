export default {
  requests: {},
  flush() {
    this.requests = {}
  },
  load(url, handler) {
    if (Object.keys(this.requests).indexOf(url) === -1) {
      this.requests[url] = {
        callbacks: [],
        response: null,
      }

      return Promise.resolve(handler()).then(response => {
        this.requests[url].response = response

        this.requests[url].callbacks.forEach(callback => callback(response))
        this.requests[url].callbacks = []

        return response
      })
    }

    if (this.requests[url].response) {
      return Promise.resolve(this.requests[url].response)
    }

    return new Promise(resolve => this.requests[url].callbacks.push(callback => resolve(callback)))
  },
}
