export default function urlWithoutHash(url) {
  url = new URL(url.href)
  url.hash = ''
  return url
}
