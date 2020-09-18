import Axios from 'axios'

export default {
  requests: {},
  flush() {
    Object.keys(this.requests).forEach(url => this.requests[url].cancelToken.cancel())
    this.requests = {}
  },
  load(url, handler) {
    return {
      request : this.attach(url, handler),
      cancelToken: this.requests[url].cancelToken,
    }
  },
  attach(url, handler) {
    if (Object.keys(this.requests).indexOf(url) === -1) {
      const cancelToken = Axios.CancelToken.source()
      this.requests[url] = {
        callbacks: [],
        response: null,
        cancelToken,
      }

      return Promise.resolve(handler(cancelToken))
        .then(response => {
          this.requests[url].response = response

          this.requests[url].callbacks.forEach(callback => callback(response))
          this.requests[url].callbacks = []

          return response
        })
        .catch(error => {
          if (Axios.isCancel(error)) {
            delete this.requests[url]
            return
          }
          Promise.reject(error)
        })
    }

    if (this.requests[url].response) {
      return Promise.resolve(this.requests[url].response)
    }

    return new Promise(resolve => this.requests[url].callbacks.push(callback => resolve(callback)))
  },
}
