// Internal extension point for first-party tooling. This is intentionally not
// part of the public API and is not documented. It lets internal packages observe
// and transform a visit's outgoing request and incoming response without coupling
// the framework-agnostic HTTP client (`http`) to Inertia visit internals. Mirrors
// the mechanism of `httpHandlers`, with the originating visit added as context.
import type { HttpRequestConfig, HttpResponse, InternalActiveVisit } from './types'

type VisitRequestHandler = (
  visit: InternalActiveVisit,
  config: HttpRequestConfig,
) => HttpRequestConfig | Promise<HttpRequestConfig>

type VisitResponseHandler = (visit: InternalActiveVisit, response: HttpResponse) => HttpResponse | Promise<HttpResponse>

class VisitInterceptors {
  protected requestHandlers: VisitRequestHandler[] = []
  protected responseHandlers: VisitResponseHandler[] = []

  public onVisitRequest(handler: VisitRequestHandler): () => void {
    this.requestHandlers.push(handler)

    return () => {
      this.requestHandlers = this.requestHandlers.filter((h) => h !== handler)
    }
  }

  public onVisitResponse(handler: VisitResponseHandler): () => void {
    this.responseHandlers.push(handler)

    return () => {
      this.responseHandlers = this.responseHandlers.filter((h) => h !== handler)
    }
  }

  public async processRequest(visit: InternalActiveVisit, config: HttpRequestConfig): Promise<HttpRequestConfig> {
    let result = config

    for (const handler of this.requestHandlers) {
      result = await handler(visit, result)
    }

    return result
  }

  public async processResponse(visit: InternalActiveVisit, response: HttpResponse): Promise<HttpResponse> {
    let result = response

    for (const handler of this.responseHandlers) {
      result = await handler(visit, result)
    }

    return result
  }
}

/**
 * @internal Not part of the public API. May change or be removed without notice.
 */
export const interceptors = new VisitInterceptors()
