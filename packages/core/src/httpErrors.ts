import { HttpResponse } from './types'

export class HttpResponseError extends Error {
  public readonly response: HttpResponse

  constructor(message: string, response: HttpResponse) {
    super(message)
    this.name = 'HttpResponseError'
    this.response = response
  }
}

export class HttpCancelledError extends Error {
  constructor(message: string = 'Request was cancelled') {
    super(message)
    this.name = 'HttpCancelledError'
  }
}

export class HttpNetworkError extends Error {
  public readonly cause?: Error
  public readonly code = 'ERR_NETWORK'

  constructor(message: string, cause?: Error) {
    super(message)
    this.name = 'HttpNetworkError'
    this.cause = cause
  }
}
