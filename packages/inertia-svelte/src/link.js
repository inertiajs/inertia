import { hrefToUrl, Inertia, mergeQueryStringWithData, shouldIntercept } from '@inertiajs/inertia'
import { createEventDispatcher } from 'svelte'

export default (node, options = {}) => {
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

  const [url, data] = mergeQueryStringWithData(
    options.method || 'get',
    hrefToUrl(node.href || options.href),
    options.data || {},
  )
  node.href = url.href
  options.data = data

  node.addEventListener('click', visit)

  return {
    update(newOptions) {
      options = newOptions
    },
    destroy() {
      node.removeEventListener('click', visit)
    },
  }
}
