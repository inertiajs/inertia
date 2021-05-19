import qs from 'qs'
import deepmerge from 'deepmerge'

export function hrefToUrl(href) {
  return new URL(href, window.location)
}

export function mergeDataIntoQueryString(method, href, data) {
  let url
  let preserveHost = true

  try {
    url = new URL(href)
  } catch(e) {
    url = new URL(href, 'http://localhost')
    preserveHost = false
  }

  if (method === 'get' && Object.keys(data).length) {
    url.search = qs.stringify(
      deepmerge(qs.parse(url.search, { ignoreQueryPrefix: true }), data), {
        encodeValuesOnly: true,
        arrayFormat: 'brackets',
      },
    )
    data = {}
  }

  return {
    href: preserveHost ? url.toString() : [url.pathname, url.search, url.hash].join(''),
    hrefWithoutHash: preserveHost ? url.toString().replace(url.hash, '') : [url.pathname, url.search].join(''),
    data,
  }
}

export function urlWithoutHash(url) {
  url = new URL(url.href)
  url.hash = ''
  return url
}
