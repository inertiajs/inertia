import qs from 'qs'
import deepmerge from 'deepmerge'

export default function mergeQueryStringsWithData(method, url, data) {
  if (method === 'get' && Object.keys(data).length) {
    url.search = qs.stringify(deepmerge(qs.parse(url.search, { ignoreQueryPrefix: true }), data))
    data = {}
  }
  return [url, data]
}
