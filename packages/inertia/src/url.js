import qs from 'qs'
import deepmerge from 'deepmerge'

export function hrefToUrl(href) {
  return new URL(href, window.location)
}

export function mergeDataIntoQueryString(method, url, data) {
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

export function urlWithoutHash(url) {
  url = new URL(url.href)
  url.hash = ''
  return url
}
