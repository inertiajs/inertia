import * as qs from 'qs'
import * as deepmerge from 'deepmerge'
import {HttpMethod} from './types/HttpMethod'

export function hrefToUrl(href: string): URL {
  return new URL(href, window.location.toString())
}

export function mergeDataIntoQueryString(
  method: HttpMethod,
  url: URL,
  data: Record<string, unknown>,
): {
  url: URL,
  data: Record<string, unknown>,
} {
  if (method === HttpMethod.GET && Object.keys(data).length) {
    url.search = qs.stringify(
      deepmerge(qs.parse(url.search, { ignoreQueryPrefix: true }), data), {
        encodeValuesOnly: true,
        arrayFormat: 'brackets',
      },
    )
    data = {}
  }
  return {
    url,
    data,
  }
}

export function urlWithoutHash(url: URL): URL {
  url = new URL(url.href)
  url.hash = ''
  return url
}
