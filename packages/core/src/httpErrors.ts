import { HttpResponse } from './types'

export class HttpError extends Error {
  public readonly code: string
  public readonly url?: string

  constructor(message: string, code: string, url?: string) {
    super(url ? `${message} (${url})` : message)
    this.name = 'HttpError'
    this.code = code
    this.url = url
  }
}

export class HttpResponseError extends HttpError {
  public readonly response: HttpResponse

  constructor(message: string, response: HttpResponse, url?: string) {
    super(message, 'ERR_HTTP_RESPONSE', url)
    this.name = 'HttpResponseError'
    this.response = response
  }
}

export class HttpCancelledError extends HttpError {
  constructor(message: string = 'Request was cancelled', url?: string) {
    super(message, 'ERR_CANCELLED', url)
    this.name = 'HttpCancelledError'
  }
}

export class HttpNetworkError extends HttpError {
  public readonly cause?: Error

  constructor(message: string, url?: string, cause?: Error) {
    super(message, 'ERR_NETWORK', url)
    this.name = 'HttpNetworkError'
    this.cause = cause
  }
}
