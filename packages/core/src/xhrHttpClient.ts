import { HttpCancelledError, HttpNetworkError, HttpResponseError } from './httpErrors'
import { HttpClient, HttpRequestConfig, HttpResponse, HttpResponseHeaders } from './types'

function parseHeaders(xhr: XMLHttpRequest): HttpResponseHeaders {
  const headers: HttpResponseHeaders = {}

  xhr.getAllResponseHeaders().split('\r\n').forEach((line) => {
    const index = line.indexOf(':')

    if (index > 0) {
      headers[line.slice(0, index).toLowerCase().trim()] = line.slice(index + 1).trim()
    }
  })

  return headers
}

function setHeaders(xhr: XMLHttpRequest, config: HttpRequestConfig): void {
  if (!config.headers) {
    return
  }

  const isFormData = config.data instanceof FormData

  Object.entries(config.headers).forEach(([key, value]) => {
    if (key.toLowerCase() !== 'content-type' || !isFormData) {
      xhr.setRequestHeader(key, String(value))
    }
  })
}

/**
 * Inertia's built-in HTTP client using XMLHttpRequest
 */
export class XhrHttpClient implements HttpClient {
  public request(config: HttpRequestConfig): Promise<HttpResponse> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      xhr.open(config.method.toUpperCase(), config.url, true)

      let body: Document | XMLHttpRequestBodyInit | null = null

      if (config.data !== null && config.data !== undefined) {
        if (config.data instanceof FormData) {
          body = config.data
        } else if (typeof config.data === 'object') {
          body = JSON.stringify(config.data)

          if (!config.headers?.['Content-Type'] && !config.headers?.['content-type']) {
            xhr.setRequestHeader('Content-Type', 'application/json')
          }
        } else {
          body = String(config.data)
        }
      }

      setHeaders(xhr, config)

      if (config.onUploadProgress) {
        xhr.upload.onprogress = (event: ProgressEvent) => {
          config.onUploadProgress!({
            progress: event.lengthComputable ? event.loaded / event.total : undefined,
            loaded: event.loaded,
            total: event.lengthComputable ? event.total : undefined,
          })
        }
      }

      if (config.signal) {
        config.signal.addEventListener('abort', () => xhr.abort())
      }

      xhr.onabort = () => reject(new HttpCancelledError())
      xhr.onerror = () => reject(new HttpNetworkError('Network error'))

      xhr.onload = () => {
        const response: HttpResponse = {
          status: xhr.status,
          data: xhr.responseText,
          headers: parseHeaders(xhr),
        }

        if (xhr.status >= 400) {
          reject(new HttpResponseError(`Request failed with status ${xhr.status}`, response))
        } else {
          resolve(response)
        }
      }

      xhr.send(body)
    })
  }
}

export const xhrHttpClient = new XhrHttpClient()
