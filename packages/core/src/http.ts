import { inertiaHttpClient } from './inertiaHttpClient'
import { HttpClient } from './types'

let httpClient: HttpClient = inertiaHttpClient

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
