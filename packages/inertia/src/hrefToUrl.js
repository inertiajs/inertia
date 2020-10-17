import urlWithoutHash from './urlWithoutHash'

export default function hrefToUrl(href) {
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
