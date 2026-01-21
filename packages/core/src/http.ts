import { HttpClient } from './types'
import { xhrHttpClient } from './xhrHttpClient'

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
export function setHttpClient(client: HttpClient): void {
  httpClient = client
}
