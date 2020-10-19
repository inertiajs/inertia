import { hrefToUrl, Inertia, mergeDataIntoQueryString, shouldIntercept } from '@inertiajs/inertia'
import { createEventDispatcher } from 'svelte'

export default (node, options = {}) => {
  const [url, data] = mergeDataIntoQueryString(options.method || 'get', hrefToUrl(node.href || options.href), options.data || {})
  node.href = url.href
  options.data = data

  const dispatch = createEventDispatcher()

  function visit(event) {
    dispatch('click', event)

    const href = node.href || options.href

    if (!href) {
      throw new Error('Option "href" is required')
    }

    if (shouldIntercept(event)) {
      event.preventDefault()
      Inertia.visit(href, options)
    }
  }

  node.addEventListener('click', visit)

  return {
    update(newOptions) {
      const [url, data] = mergeDataIntoQueryString(newOptions.method || 'get', hrefToUrl(node.href || newOptions.href), newOptions.data || {})
      node.href = url.href
      newOptions.data = data
      options = newOptions
    },
    destroy() {
      node.removeEventListener('click', visit)
    },
  }
}
