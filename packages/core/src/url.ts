import * as qs from 'qs'
import { config } from './config'
import { hasFiles } from './files'
import { isFormData, objectToFormData } from './formData'
import type {
  FormDataConvertible,
  Method,
  QueryStringArrayFormatOption,
  RequestPayload,
  UrlMethodPair,
  VisitOptions,
} from './types'

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
    if (config.get('form.forceIndicesArrayFormatInFormData')) {
      queryStringArrayFormat = 'indices'
    }

    data = objectToFormData(data, new FormData(), null, queryStringArrayFormat)
  }

  if (isFormData(data)) {
    return [url, data]
  }

  const [_href, _data] = mergeDataIntoQueryString(method, url, data, queryStringArrayFormat)

  return [hrefToUrl(_href), _data]
}

type MergeDataIntoQueryStringDataReturnType<T extends RequestPayload> =
  T extends Record<string, FormDataConvertible> ? Record<string, FormDataConvertible> : RequestPayload

export function mergeDataIntoQueryString<T extends RequestPayload>(
  method: Method,
  href: URL | string,
  data: T,
  qsArrayFormat: QueryStringArrayFormatOption = 'brackets',
): [string, MergeDataIntoQueryStringDataReturnType<T>] {
  const hasDataForQueryString = method === 'get' && !isFormData(data) && Object.keys(data).length > 0
  const hasHost = urlHasProtocol(href.toString())
  const hasAbsolutePath = hasHost || href.toString().startsWith('/') || href.toString() === ''
  const hasRelativePath = !hasAbsolutePath && !href.toString().startsWith('#') && !href.toString().startsWith('?')
  const hasRelativePathWithDotPrefix = /^[.]{1,2}([/]|$)/.test(href.toString())
  const hasSearch = href.toString().includes('?') || hasDataForQueryString
  const hasHash = href.toString().includes('#')

  const url = new URL(href.toString(), typeof window === 'undefined' ? 'http://localhost' : window.location.toString())

  if (hasDataForQueryString) {
    const parseOptions = { ignoreQueryPrefix: true, arrayLimit: -1 }
    url.search = qs.stringify(
      { ...qs.parse(url.search, parseOptions), ...data },
      {
        encodeValuesOnly: true,
        arrayFormat: qsArrayFormat,
      },
    )
  }

  return [
    [
      hasHost ? `${url.protocol}//${url.host}` : '',
      hasAbsolutePath ? url.pathname : '',
      hasRelativePath ? url.pathname.substring(hasRelativePathWithDotPrefix ? 0 : 1) : '',
      hasSearch ? url.search : '',
      hasHash ? url.hash : '',
    ].join(''),
    (hasDataForQueryString ? {} : data) as MergeDataIntoQueryStringDataReturnType<T>,
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

export function isUrlMethodPair(href: unknown): href is UrlMethodPair {
  return href !== null && typeof href === 'object' && href !== undefined && 'url' in href && 'method' in href
}

export function urlHasProtocol(url: string): boolean {
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(url)
}

export function urlToString(url: URL | string, absolute: boolean): string {
  const urlObj = typeof url === 'string' ? hrefToUrl(url) : url

  return absolute
    ? `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}${urlObj.search}${urlObj.hash}`
    : `${urlObj.pathname}${urlObj.search}${urlObj.hash}`
}
