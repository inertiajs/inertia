import * as qs from 'qs'
import deepmerge from 'deepmerge'
import { FormDataConvertible, Method } from './types'

export function hrefToUrl(href: string|URL): URL {
  return new URL(href.toString(), window.location.toString())
}

export function mergeDataIntoQueryString(
  method: Method,
  url: URL,
  data: Record<string, FormDataConvertible>,
): [URL, Record<string, FormDataConvertible>] {
  if (method === Method.GET && Object.keys(data).length) {
    url.search = qs.stringify(
      deepmerge(qs.parse(url.search, { ignoreQueryPrefix: true }), data), {
        encodeValuesOnly: true,
        arrayFormat: 'brackets',
      },
    )
    data = {}
  }
  return [
    url,
    data,
  ]
}

export function urlWithoutHash(url: URL|Location): URL {
  url = new URL(url.href)
  url.hash = ''
  return url
}
