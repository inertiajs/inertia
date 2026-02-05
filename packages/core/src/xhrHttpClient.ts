import { HttpCancelledError, HttpNetworkError, HttpResponseError } from './httpErrors'
import { httpHandlers } from './httpHandlers'
import {
  FormDataConvertible,
  HttpClient,
  HttpClientOptions,
  HttpRequestConfig,
  HttpResponse,
  HttpResponseHeaders,
} from './types'
import { mergeDataIntoQueryString } from './url'

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'))

  return match ? decodeURIComponent(match[3]) : null
}

function parseHeaders(xhr: XMLHttpRequest): HttpResponseHeaders {
  const headers: HttpResponseHeaders = {}

  xhr
    .getAllResponseHeaders()
    .split('\r\n')
    .forEach((line) => {
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

function buildUrlWithParams(url: string, params?: Record<string, unknown>): string {
  if (!params || Object.keys(params).length === 0) {
    return url
  }

  // Pass 'get' to force merging params into URL regardless of actual method (matches Axios behavior)
  const [urlWithParams] = mergeDataIntoQueryString('get', url, params as Record<string, FormDataConvertible>)

  return urlWithParams
}

/**
 * Inertia's built-in HTTP client using XMLHttpRequest
 */
export class XhrHttpClient implements HttpClient {
  protected xsrfCookieName: string
  protected xsrfHeaderName: string

  constructor(options: HttpClientOptions = {}) {
    this.xsrfCookieName = options.xsrfCookieName ?? 'XSRF-TOKEN'
    this.xsrfHeaderName = options.xsrfHeaderName ?? 'X-XSRF-TOKEN'
  }

  public async request(config: HttpRequestConfig): Promise<HttpResponse> {
    const processedConfig = await httpHandlers.processRequest(config)

    try {
      const response = await this.doRequest(processedConfig)

      return await httpHandlers.processResponse(response)
    } catch (error) {
      if (
        error instanceof HttpResponseError ||
        error instanceof HttpNetworkError ||
        error instanceof HttpCancelledError
      ) {
        await httpHandlers.processError(error)
      }

      throw error
    }
  }

  protected doRequest(config: HttpRequestConfig): Promise<HttpResponse> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      const url = buildUrlWithParams(config.url, config.params)

      xhr.open(config.method.toUpperCase(), url, true)

      const xsrfToken = getCookie(this.xsrfCookieName)

      if (xsrfToken) {
        xhr.setRequestHeader(this.xsrfHeaderName, xsrfToken)
      }

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

      xhr.onabort = () => reject(new HttpCancelledError('Request was cancelled', config.url))
      xhr.onerror = () => reject(new HttpNetworkError('Network error', config.url))

      xhr.onload = () => {
        const response: HttpResponse = {
          status: xhr.status,
          data: xhr.responseText,
          headers: parseHeaders(xhr),
        }

        if (xhr.status >= 400) {
          reject(new HttpResponseError(`Request failed with status ${xhr.status}`, response, config.url))
        } else {
          resolve(response)
        }
      }

      xhr.send(body)
    })
  }
}

export const xhrHttpClient = new XhrHttpClient()
