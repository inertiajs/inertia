export default {
  response: (request, data) => {
    return {
      cancelled: false,
      data: {},
      status: 0,
      headers: {},
      isInertiaResponse: false,
      request,
      ... data,
    }
  },
  transformResponse(data) {
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data)
      } catch (e) { /* Ignore */ }
    }

    return data
  },
  dispatch({ method, url, data, headers, onProgress }) {
    method = method ? method.toUpperCase() : 'GET'
    headers = {
      'Content-Type': 'application/json;charset=utf-8',
      'X-Requested-With': 'XMLHttpRequest',
      ... (headers || {}),
    }

    const params = new URLSearchParams(method === 'GET' ? data : {}).toString()
    const builtUrl = url + (params.length ? '?' + params : '')
    const body = method === 'GET' ? {} : data

    const request = new XMLHttpRequest()
    const promise = new Promise((resolve, reject) => {
      request.open(method, builtUrl, true)

      Object.keys(headers || {}).forEach(key => {
        request.setRequestHeader(key, headers[key])
      })

      if (onProgress) {
        request.onprogress = onProgress
      }

      request.onerror = () => reject(this.response(request))
      request.onabort = () => reject(this.response(request, {
        cancelled: true,
      }))

      request.onreadystatechange = () => {
        if (request.readyState !== XMLHttpRequest.DONE || !request.status) {
          return
        }

        const response = this.response(request, {
          data: this.transformResponse(request.responseText),
          status: request.status,
          headers: request.getAllResponseHeaders(),
          isInertiaResponse: request.getResponseHeader('x-inertia') !== null,
        })

        if (request.status >= 200 && request.status < 300) {
          return resolve(response)
        }

        reject(response)
      }

      request.send(JSON.stringify(body))
    })

    promise.cancel = () => request.abort()

    return promise
  },
}
