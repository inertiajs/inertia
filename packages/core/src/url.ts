import * as qs from 'qs'
import { hasFiles } from './files'
import { isFormData, objectToFormData } from './formData'
import {
  AssetOptions,
  FormDataConvertible,
  Method,
  PreloadOptions,
  RequestPayload,
  UrlMethodPair,
  VisitOptions,
} from './types'

export function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

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

type MergeDataIntoQueryStringDataReturnType<T extends RequestPayload> =
  T extends Record<string, FormDataConvertible> ? Record<string, FormDataConvertible> : RequestPayload

export function mergeDataIntoQueryString<T extends RequestPayload>(
  method: Method,
  href: URL | string,
  data: T,
  qsArrayFormat: 'indices' | 'brackets' = 'brackets',
): [string, MergeDataIntoQueryStringDataReturnType<T>] {
  const hasDataForQueryString = method === 'get' && !isFormData(data) && Object.keys(data).length > 0
  const hasHost = /^[a-z][a-z0-9+.-]*:\/\//i.test(href.toString())
  const hasAbsolutePath = hasHost || href.toString().startsWith('/') || href.toString() === ''
  const hasRelativePath = !hasAbsolutePath && !href.toString().startsWith('#') && !href.toString().startsWith('?')
  const hasRelativePathWithDotPrefix = /^[.]{1,2}([/]|$)/.test(href.toString())
  const hasSearch = href.toString().includes('?') || hasDataForQueryString
  const hasHash = href.toString().includes('#')

  const url = new URL(href.toString(), typeof window === 'undefined' ? 'http://localhost' : window.location.toString())

  if (hasDataForQueryString) {
    const parseOptions = { ignoreQueryPrefix: true, parseArrays: false }
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

function toHost(input: string): string | null {
  if (!input) return null

  try {
    const url = input.match(/^https?:\/\//i) ? new URL(input) : new URL(`http://${input}`)
    const defaultPorts = new Set(['', '80', '443'])
    return defaultPorts.has(url.port) ? url.hostname : url.host
  } catch {
    const cleaned = input
      .replace(/^https?:\/\//i, '')
      .replace(/\/.*/, '')
      .trim()
    return cleaned || null
  }
}

function envAppHost(): { host: string; protocol?: string } | null {
  const env = typeof process !== 'undefined' ? process.env : undefined
  if (!env) return null

  const candidate = env.APP_URL || env.VITE_APP_URL

  if (!candidate) return null

  try {
    const useUrl = candidate.match(/^https?:\/\//i) ? candidate : `http://${candidate}`
    const url = new URL(useUrl)
    const defaultPorts = new Set(['', '80', '443'])
    const host = defaultPorts.has(url.port) ? url.hostname : url.host
    const protocol = url.protocol.replace(':', '')
    return { host, protocol }
  } catch {
    const host = toHost(candidate)
    return host ? { host } : null
  }
}

export function appURL(fallbackUrl?: string): string {
  if (!isBrowser()) {
    const fromFallback = toHost(fallbackUrl || '')
    if (fromFallback) return fromFallback

    const fromEnv = envAppHost()

    if (fromEnv?.host) return fromEnv.host

    return ''
  }

  const { host, port, hostname } = window.location
  const defaultPorts = new Set(['', '80', '443'])

  return defaultPorts.has(port) ? hostname : host
}

export function asset(path: string, options?: AssetOptions): string
export function asset(path: string, secureOrOptions?: boolean | AssetOptions, fallbackUrl?: string): string
export function asset(path: string, secureOrOptions?: boolean | AssetOptions, fallbackUrl?: string): string {
  return _assetInternal(path, secureOrOptions as any, fallbackUrl)
}

function _assetInternal(path: string, secureOrOptions?: boolean | AssetOptions, fallbackUrl?: string): string {
  const cleanPath = (path || '').replace(/^\/+/, '')

  const { secure, fallback, preload } = (() => {
    if (typeof secureOrOptions === 'object' && secureOrOptions !== null) {
      return {
        secure: secureOrOptions.secure,
        fallback: secureOrOptions.fallbackUrl,
        preload: secureOrOptions.preload,
      }
    }
    return { secure: secureOrOptions as boolean | undefined, fallback: fallbackUrl, preload: undefined }
  })()

  const host = appURL(fallback)

  let protocol = 'https'
  if (secure === true) {
    protocol = 'https'
  } else if (secure === undefined) {
    if (isBrowser()) {
      protocol = window.location.protocol.replace(':', '') || 'https'
    } else {
      const env = envAppHost()
      protocol = env?.protocol || 'https'
    }
  } else {
    protocol = isBrowser() ? window.location.protocol.replace(':', '') || 'http' : 'http'
  }

  const url = host ? `${protocol}://${host}/${cleanPath}` : `/${cleanPath}`

  if (preload && isBrowser()) {
    const preloadOptions: PreloadOptions = typeof preload === 'object' ? preload : {}
    const asHint = preloadOptions.as || guessAsFromPath(cleanPath)
    if (asHint) {
      injectPreloadLink(url, { ...preloadOptions, as: asHint })
    }
  }

  return url
}

function guessAsFromPath(path: string): string | null {
  const lower = path.toLowerCase()
  if (lower.endsWith('.js') || lower.endsWith('.mjs') || lower.endsWith('.cjs')) return 'script'
  if (lower.endsWith('.css')) return 'style'
  if (/(\.woff2?|\.ttf|\.otf|\.eot)$/i.test(lower)) return 'font'
  if (/(\.avif|\.webp|\.png|\.jpe?g|\.gif|\.svg)$/i.test(lower)) return 'image'
  if (/(\.mp4|\.webm|\.ogv)$/i.test(lower)) return 'video'
  if (/(\.mp3|\.ogg|\.wav)$/i.test(lower)) return 'audio'
  if (lower.endsWith('.json')) return 'fetch'
  return null
}

function injectPreloadLink(href: string, opts: Required<Pick<PreloadOptions, 'as'>> & PreloadOptions) {
  try {
    const links = Array.from(document.head.querySelectorAll('link[rel="preload"]')) as HTMLLinkElement[]
    if (links.some((l) => l.href === href)) return

    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = opts.as
    link.href = href
    if (opts.crossorigin) link.crossOrigin = opts.crossorigin
    if (opts.type) link.type = opts.type
    if (opts.fetchpriority) link.setAttribute('fetchpriority', opts.fetchpriority)
    document.head.appendChild(link)
  } catch {}
}

export function isUrlMethodPair(href: unknown): href is UrlMethodPair {
  return href !== null && typeof href === 'object' && href !== undefined && 'url' in href && 'method' in href
}
