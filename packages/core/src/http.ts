import { client as precognitionClient } from 'laravel-precognition'
import { httpHandlers } from './httpHandlers'
import { stringifyJson } from './json'
import { HttpClient, HttpClientOptions } from './types'
import { XhrHttpClient, xhrHttpClient } from './xhrHttpClient'

// Precognition serializes its own request bodies, so it is handed the same
// encoder the rest of Inertia uses. Bodies without big integers serialize
// exactly as a plain stringify would.
precognitionClient.withSerializer(stringifyJson)

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
  setClient(clientOrOptions: HttpClient | HttpClientOptions): void {
    if (!isHttpClientOptions(clientOrOptions)) {
      httpClient = clientOrOptions
      return
    }

    httpClient = new XhrHttpClient(clientOrOptions)

    if (clientOrOptions.xsrfCookieName) {
      precognitionClient.withXsrfCookieName(clientOrOptions.xsrfCookieName)
    }

    if (clientOrOptions.xsrfHeaderName) {
      precognitionClient.withXsrfHeaderName(clientOrOptions.xsrfHeaderName)
    }
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
