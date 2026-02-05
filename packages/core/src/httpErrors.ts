import { HttpResponse } from './types'

export class HttpResponseError extends Error {
  public readonly response: HttpResponse
  public readonly url?: string

  constructor(message: string, response: HttpResponse, url?: string) {
    super(url ? `${message} (${url})` : message)
    this.name = 'HttpResponseError'
    this.response = response
    this.url = url
  }
}

export class HttpCancelledError extends Error {
  public readonly url?: string

  constructor(message: string = 'Request was cancelled', url?: string) {
    super(url ? `${message} (${url})` : message)
    this.name = 'HttpCancelledError'
    this.url = url
  }
}

export class HttpNetworkError extends Error {
  public readonly cause?: Error
  public readonly code = 'ERR_NETWORK'
  public readonly url?: string

  constructor(message: string, url?: string, cause?: Error) {
    super(url ? `${message} (${url})` : message)
    this.name = 'HttpNetworkError'
    this.url = url
    this.cause = cause
  }
}
