import { mergeDataIntoQueryString, router, shouldIntercept } from '@inertiajs/core'

export default (node, options = {}) => {
  const [href, data] = hrefAndData(options)
  node.href = href
  options.data = data

  function hrefAndData(options) {
    return mergeDataIntoQueryString(
      options.method || 'get',
      node.href || options.href || '',
      options.data || {},
      options.queryStringArrayFormat || 'brackets',
    )
  }

  function visit(event) {
    if (!node.href) {
      throw new Error('Option "href" is required')
    }

    if (shouldIntercept(event)) {
      event.preventDefault()

      router.visit(node.href, options)
    }
  }

  node.addEventListener('click', visit)

  return {
    update(newOptions) {
      const [href, data] = hrefAndData(newOptions)
      node.href = href
      options = { ...newOptions, data }
    },
    destroy() {
      node.removeEventListener('click', visit)
    },
  }
}
