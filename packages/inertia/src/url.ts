import * as qs from 'qs'
import * as deepmerge from 'deepmerge'
import { FormDataConvertible, HttpMethod } from './types'

export function hrefToUrl(href: string|URL): URL {
  return new URL(href.toString(), window.location.toString())
}

export function mergeDataIntoQueryString(
  method: HttpMethod,
  url: URL,
  data: Record<string, FormDataConvertible>,
): URL {
  if (Object.keys(data).length) {
    url.search = qs.stringify(
      deepmerge(qs.parse(url.search, { ignoreQueryPrefix: true }), data), {
        encodeValuesOnly: true,
        arrayFormat: 'brackets',
      },
    )
  }
  return url
}

export function urlWithoutHash(url: URL|Location): URL {
  url = new URL(url.href)
  url.hash = ''
  return url
}
