import qs from 'qs'
import deepmerge from 'deepmerge'

export function hrefToUrl(href) {
  try {
    if (href.startsWith('#')) {
      return new URL(`${urlWithoutHash(window.location)}${href}`)
    } else {
      return new URL(href)
    }
  } catch (error) {
    return new URL(`${window.location.origin}${href}`)
  }
}

export function mergeDataIntoQueryString(method, url, data) {
  if (method === 'get' && Object.keys(data).length) {
    url.search = qs.stringify(deepmerge(qs.parse(url.search, { ignoreQueryPrefix: true }), data), { encode: false })
    data = {}
  }
  return [url, data]
}

export function urlWithoutHash(url) {
  url = new URL(url.href)
  url.hash = ''
  return url
}
