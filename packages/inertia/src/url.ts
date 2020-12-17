import { Method } from 'axios'
import deepmerge from 'deepmerge'
import qs from 'qs'

export function hrefToUrl(href: string) {
  return new URL(href, window.location.href)
}

export function mergeDataIntoQueryString(method: Method, url: URL, data: any) {
  if (method === 'get' && Object.keys(data).length) {
    url.search = qs.stringify(
      deepmerge(qs.parse(url.search, { ignoreQueryPrefix: true }), data), {
        encodeValuesOnly: true,
        arrayFormat: 'brackets',
      },
    )
    data = {}
  }
  return [url, data]
}

export function urlWithoutHash(url: URL | Location) {
  url = new URL(url.href)
  url.hash = ''
  return url
}
