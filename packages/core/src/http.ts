import { HttpClient, HttpClientOptions } from './types'
import { XhrHttpClient, xhrHttpClient } from './xhrHttpClient'

let httpClient: HttpClient = xhrHttpClient

/**
 * Get the current HTTP client
 */
export function getHttpClient(): HttpClient {
  return httpClient
}

/**
 * Set the HTTP client to use for all Inertia requests
 */
export function setHttpClient(client: HttpClient | HttpClientOptions): void {
  httpClient = isHttpClientOptions(client) ? new XhrHttpClient(client) : client
}

function isHttpClientOptions(client: HttpClient | HttpClientOptions): client is HttpClientOptions {
  return !('request' in client)
}
