import { mergeDataIntoQueryString, router, shouldIntercept } from '@inertiajs/core'
import { createEventDispatcher } from 'svelte'

export default (node, options = {}) => {
  const [href, data] = mergeDataIntoQueryString(
    options.method || 'get',
    node.href || options.href || '',
    options.data || {},
    options.queryStringArrayFormat || 'brackets',
  )
  node.href = href
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
      router.visit(href, options)
    }
  }

  node.addEventListener('click', visit)

  return {
    update(newOptions) {
      const [href, data] = mergeDataIntoQueryString(
        newOptions.method || 'get',
        node.href || newOptions.href,
        newOptions.data || {},
        newOptions.queryStringArrayFormat || 'brackets',
      )
      node.href = href
      newOptions.data = data
      options = newOptions
    },
    destroy() {
      node.removeEventListener('click', visit)
    },
  }
}
