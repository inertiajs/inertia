import { Inertia, shouldIntercept } from '@inertiajs/inertia'
import { createEventDispatcher } from 'svelte'

export default (node, options = {}) => {
  const dispatch = createEventDispatcher()

  options.onCancelToken = cancelToken => fireEvent('cancelToken', { detail: { cancelToken } })
  options.onStart = visit => fireEvent('start', { cancelable: true, detail: { visit } })
  options.onProgress = progress => fireEvent('progress', { detail: { progress } })
  options.onFinish = () => fireEvent('finish')
  options.onCancel = () => fireEvent('cancel')
  options.onSuccess = page => fireEvent('success', { detail: { page } })

  function fireEvent(name, eventOptions) {
    return node.dispatchEvent(new CustomEvent(name, eventOptions))
  }

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
