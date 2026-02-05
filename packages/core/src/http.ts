import { httpHandlers } from './httpHandlers'
import { HttpClient, HttpClientOptions } from './types'
import { XhrHttpClient, xhrHttpClient } from './xhrHttpClient'

let httpClient: HttpClient = xhrHttpClient

function isHttpClientOptions(client: HttpClient | HttpClientOptions): client is HttpClientOptions {
  return !('request' in client)
}

export const http = {
  /**
   * Get the current HTTP client
   */
  getClient(): HttpClient {
    return httpClient
  },

  /**
   * Set the HTTP client to use for all Inertia requests
   */
  setClient(client: HttpClient | HttpClientOptions): void {
    httpClient = isHttpClientOptions(client) ? new XhrHttpClient(client) : client
  },

  /**
   * Register a request handler that runs before each request
   */
  onRequest: httpHandlers.onRequest.bind(httpHandlers),

  /**
   * Register a response handler that runs after each successful response
   */
  onResponse: httpHandlers.onResponse.bind(httpHandlers),

  /**
   * Register an error handler that runs when a request fails
   */
  onError: httpHandlers.onError.bind(httpHandlers),

  /**
   * Process a request config through all registered request handlers.
   * For use by custom HttpClient implementations.
   */
  processRequest: httpHandlers.processRequest.bind(httpHandlers),

  /**
   * Process a response through all registered response handlers.
   * For use by custom HttpClient implementations.
   */
  processResponse: httpHandlers.processResponse.bind(httpHandlers),

  /**
   * Process an error through all registered error handlers.
   * For use by custom HttpClient implementations.
   */
  processError: httpHandlers.processError.bind(httpHandlers),
}
