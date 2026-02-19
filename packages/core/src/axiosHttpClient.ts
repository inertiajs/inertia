import type { AxiosInstance, AxiosProgressEvent } from 'axios'
import axios from 'axios'
import { HttpCancelledError, HttpNetworkError, HttpResponseError } from './httpErrors'
import { httpHandlers } from './httpHandlers'
import { HttpClient, HttpProgressEvent, HttpRequestConfig, HttpResponse, HttpResponseHeaders } from './types'

/**
 * Normalize Axios headers to a simple string record with lowercase keys
 */
function normalizeHeaders(headers: unknown): HttpResponseHeaders {
  if (!headers || typeof headers !== 'object') {
    return {}
  }

  const normalized: HttpResponseHeaders = {}

  const entries =
    typeof (headers as Record<string, unknown>).entries === 'function'
      ? Array.from((headers as { entries: () => Iterable<[string, unknown]> }).entries())
      : Object.entries(headers)

  for (const [key, value] of entries as [string, unknown][]) {
    if (typeof value === 'string') {
      normalized[key.toLowerCase()] = value
    } else if (Array.isArray(value)) {
      normalized[key.toLowerCase()] = value.join(', ')
    }
  }

  return normalized
}

/**
 * Convert Axios progress event to framework-agnostic progress event
 */
function toHttpProgressEvent(axiosEvent: AxiosProgressEvent): HttpProgressEvent {
  return {
    progress: axiosEvent.progress,
    loaded: axiosEvent.loaded,
    total: axiosEvent.total,
  }
}

/**
 * HTTP client implementation using Axios
 */
export class AxiosHttpClient implements HttpClient {
  private axios?: AxiosInstance

  constructor(instance?: AxiosInstance) {
    this.axios = instance
  }

  private async getAxios(): Promise<AxiosInstance> {
    if (!this.axios) {
      return (this.axios = axios)
    }

    return this.axios
  }

  async request(config: HttpRequestConfig): Promise<HttpResponse> {
    const processedConfig = await httpHandlers.processRequest(config)

    try {
      const response = await this.doRequest(processedConfig)

      return await httpHandlers.processResponse(response)
    } catch (error) {
      if (
        error instanceof HttpResponseError ||
        error instanceof HttpNetworkError ||
        error instanceof HttpCancelledError
      ) {
        await httpHandlers.processError(error)
      }

      throw error
    }
  }

  protected async doRequest(config: HttpRequestConfig): Promise<HttpResponse> {
    const axios = await this.getAxios()

    try {
      const response = await axios({
        method: config.method,
        url: config.url,
        data: config.data,
        params: config.params,
        headers: config.headers as Record<string, string>,
        signal: config.signal,
        responseType: 'text',
        onUploadProgress: config.onUploadProgress
          ? (event: AxiosProgressEvent) => config.onUploadProgress!(toHttpProgressEvent(event))
          : undefined,
      })

      return {
        status: response.status,
        data: response.data,
        headers: normalizeHeaders(response.headers),
      }
    } catch (error) {
      const axiosModule = await import('axios')

      if (axiosModule.default.isCancel(error)) {
        throw new HttpCancelledError('Request was cancelled', config.url)
      }

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { status: number; data: string; headers: unknown } }
        const httpResponse: HttpResponse = {
          status: axiosError.response.status,
          data: axiosError.response.data,
          headers: normalizeHeaders(axiosError.response.headers),
        }

        throw new HttpResponseError(
          `Request failed with status ${axiosError.response.status}`,
          httpResponse,
          config.url,
        )
      }

      throw new HttpNetworkError(
        error instanceof Error ? error.message : 'Network error',
        config.url,
        error instanceof Error ? error : undefined,
      )
    }
  }
}

/**
 * Create an Axios HTTP client adapter
 */
export function axiosAdapter(instance?: AxiosInstance): HttpClient {
  return new AxiosHttpClient(instance)
}
