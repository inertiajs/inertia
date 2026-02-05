import { HttpCancelledError, HttpNetworkError, HttpResponseError } from './httpErrors'
import { HttpErrorHandler, HttpRequestConfig, HttpRequestHandler, HttpResponse, HttpResponseHandler } from './types'

class HttpHandlers {
  protected requestHandlers: HttpRequestHandler[] = []
  protected responseHandlers: HttpResponseHandler[] = []
  protected errorHandlers: HttpErrorHandler[] = []

  public onRequest(handler: HttpRequestHandler): () => void {
    this.requestHandlers.push(handler)

    return () => {
      this.requestHandlers = this.requestHandlers.filter((h) => h !== handler)
    }
  }

  public onResponse(handler: HttpResponseHandler): () => void {
    this.responseHandlers.push(handler)

    return () => {
      this.responseHandlers = this.responseHandlers.filter((h) => h !== handler)
    }
  }

  public onError(handler: HttpErrorHandler): () => void {
    this.errorHandlers.push(handler)

    return () => {
      this.errorHandlers = this.errorHandlers.filter((h) => h !== handler)
    }
  }

  public async processRequest(config: HttpRequestConfig): Promise<HttpRequestConfig> {
    let result = config

    for (const handler of this.requestHandlers) {
      result = await handler(result)
    }

    return result
  }

  public async processResponse(response: HttpResponse): Promise<HttpResponse> {
    let result = response

    for (const handler of this.responseHandlers) {
      result = await handler(result)
    }

    return result
  }

  public async processError(error: HttpResponseError | HttpNetworkError | HttpCancelledError): Promise<void> {
    for (const handler of this.errorHandlers) {
      await handler(error)
    }
  }
}

export const httpHandlers = new HttpHandlers()
