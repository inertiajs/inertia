import { Inertia, shouldIntercept } from '@inertiajs/inertia'
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

  node.addEventListener('click', visit)

  return {
    destroy() {
      node.removeEventListener('click', visit)
    }
  }
}
