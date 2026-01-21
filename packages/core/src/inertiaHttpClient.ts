import { HttpCancelledError, HttpNetworkError, HttpResponseError } from './httpErrors'
import { HttpClient, HttpProgressEvent, HttpRequestConfig, HttpResponse, HttpResponseHeaders } from './types'

function headersToObject(headers: Headers): HttpResponseHeaders {
  const result: HttpResponseHeaders = {}

  headers.forEach((value, key) => {
    result[key.toLowerCase()] = value
  })

  return result
}

function objectToHeaders(obj: Record<string, unknown> | undefined): Headers {
  const headers = new Headers()

  if (obj) {
    Object.entries(obj).forEach(([key, value]) => {
      headers.set(key, String(value))
    })
  }

  return headers
}

function setXhrHeaders(xhr: XMLHttpRequest, config: HttpRequestConfig): void {
  if (!config.headers) {
    return
  }

  Object.entries(config.headers).forEach(([key, value]) => {
    if (key.toLowerCase() !== 'content-type' || !(config.data instanceof FormData)) {
      xhr.setRequestHeader(key, String(value))
    }
  })
}

/**
 * Parse XHR response headers to plain object with lowercase keys
 */
function parseXhrHeaders(xhr: XMLHttpRequest): HttpResponseHeaders {
  const headers: HttpResponseHeaders = {}
  const headerString = xhr.getAllResponseHeaders()

  headerString.split('\r\n').forEach((line) => {
    const separatorIndex = line.indexOf(':')

    if (separatorIndex > 0) {
      const key = line.slice(0, separatorIndex).toLowerCase().trim()
      const value = line.slice(separatorIndex + 1).trim()
      headers[key] = value
    }
  })

  return headers
}

/**
 * Check if a status code indicates an error response
 */
function isFailedStatus(status: number): boolean {
  return status >= 400
}

/**
 * Inertia's built-in HTTP client
 */
export class InertiaHttpClient implements HttpClient {
  async request(config: HttpRequestConfig): Promise<HttpResponse> {
    // Use XHR for FormData with progress callback (Fetch doesn't support upload progress)
    if (config.data instanceof FormData && config.onUploadProgress) {
      return this.xhrRequest(config)
    }

    return this.fetchRequest(config)
  }

  /**
   * Make a request using the Fetch API
   */
  private async fetchRequest(config: HttpRequestConfig): Promise<HttpResponse> {
    const headers = objectToHeaders(config.headers)
    let body: BodyInit | undefined

    if (config.data !== null && config.data !== undefined) {
      if (config.data instanceof FormData) {
        body = config.data
      } else if (typeof config.data === 'object') {
        body = JSON.stringify(config.data)

        if (!headers.has('Content-Type')) {
          headers.set('Content-Type', 'application/json')
        }
      } else {
        body = String(config.data)
      }
    }

    try {
      const response = await fetch(config.url, {
        method: config.method.toUpperCase(),
        headers,
        body,
        signal: config.signal,
      })

      const httpResponse: HttpResponse = {
        status: response.status,
        data: await response.text(),
        headers: headersToObject(response.headers),
      }

      if (isFailedStatus(response.status)) {
        throw new HttpResponseError(`Request failed with status ${response.status}`, httpResponse)
      }

      return httpResponse
    } catch (error) {
      if (error instanceof HttpResponseError) {
        throw error
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new HttpCancelledError()
      }

      throw new HttpNetworkError(
        error instanceof Error ? error.message : 'Network error',
        error instanceof Error ? error : undefined,
      )
    }
  }

  /**
   * Make a request using XMLHttpRequest (for upload progress support)
   */
  private xhrRequest(config: HttpRequestConfig): Promise<HttpResponse> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      xhr.open(config.method.toUpperCase(), config.url, true)

      setXhrHeaders(xhr, config)

      if (config.onUploadProgress) {
        xhr.upload.onprogress = (event: ProgressEvent) => {
          const progressEvent: HttpProgressEvent = {
            progress: event.lengthComputable ? event.loaded / event.total : undefined,
            loaded: event.loaded,
            total: event.lengthComputable ? event.total : undefined,
          }

          config.onUploadProgress!(progressEvent)
        }
      }

      if (config.signal) {
        config.signal.addEventListener('abort', () => xhr.abort())
      }

      xhr.onabort = () => reject(new HttpCancelledError())
      xhr.onerror = () => reject(new HttpNetworkError('Network error'))
      xhr.onload = () => {
        const httpResponse: HttpResponse = {
          status: xhr.status,
          data: xhr.responseText,
          headers: parseXhrHeaders(xhr),
        }

        if (isFailedStatus(xhr.status)) {
          reject(new HttpResponseError(`Request failed with status ${xhr.status}`, httpResponse))
        } else {
          resolve(httpResponse)
        }
      }

      xhr.send(config.data as FormData)
    })
  }
}

export const inertiaHttpClient = new InertiaHttpClient()
