import { merge } from 'es-toolkit'
import * as qs from 'qs'
import { hasFiles } from './files'
import { isFormData, objectToFormData } from './formData'
import { FormDataConvertible, Method, RequestPayload, VisitOptions } from './types'

export function hrefToUrl(href: string | URL): URL {
  return new URL(href.toString(), typeof window === 'undefined' ? undefined : window.location.toString())
}

export const transformUrlAndData = (
  href: string | URL,
  data: RequestPayload,
  method: Method,
  forceFormData: VisitOptions['forceFormData'],
  queryStringArrayFormat: VisitOptions['queryStringArrayFormat'],
): [URL, RequestPayload] => {
  let url = typeof href === 'string' ? hrefToUrl(href) : href

  if ((hasFiles(data) || forceFormData) && !isFormData(data)) {
    data = objectToFormData(data)
  }

  if (isFormData(data)) {
    return [url, data]
  }

  const [_href, _data] = mergeDataIntoQueryString(method, url, data, queryStringArrayFormat)

  return [hrefToUrl(_href), _data]
}

export function mergeDataIntoQueryString(
  method: Method,
  href: URL | string,
  data: Record<string, FormDataConvertible>,
  qsArrayFormat: 'indices' | 'brackets' = 'brackets',
): [string, Record<string, FormDataConvertible>] {
  const hasHost = /^https?:\/\//.test(href.toString())
  const hasAbsolutePath = hasHost || href.toString().startsWith('/')
  const hasRelativePath = !hasAbsolutePath && !href.toString().startsWith('#') && !href.toString().startsWith('?')
  const hasSearch = href.toString().includes('?') || (method === 'get' && Object.keys(data).length)
  const hasHash = href.toString().includes('#')

  const url = new URL(href.toString(), 'http://localhost')

  if (method === 'get' && Object.keys(data).length) {
    url.search = qs.stringify(merge(qs.parse(url.search, { ignoreQueryPrefix: true }), data), {
      encodeValuesOnly: true,
      arrayFormat: qsArrayFormat,
    })
    data = {}
  }

  return [
    [
      hasHost ? `${url.protocol}//${url.host}` : '',
      hasAbsolutePath ? url.pathname : '',
      hasRelativePath ? url.pathname.substring(1) : '',
      hasSearch ? url.search : '',
      hasHash ? url.hash : '',
    ].join(''),
    data,
  ]
}

export function urlWithoutHash(url: URL | Location): URL {
  url = new URL(url.href)
  url.hash = ''
  return url
}

export const setHashIfSameUrl = (originUrl: URL | Location, destinationUrl: URL | Location) => {
  if (originUrl.hash && !destinationUrl.hash && urlWithoutHash(originUrl).href === destinationUrl.href) {
    destinationUrl.hash = originUrl.hash
  }
}

export const isSameUrlWithoutHash = (url1: URL | Location, url2: URL | Location): boolean => {
  return urlWithoutHash(url1).href === urlWithoutHash(url2).href
}
