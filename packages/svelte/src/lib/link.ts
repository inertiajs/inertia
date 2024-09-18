import { mergeDataIntoQueryString, router, shouldIntercept, type VisitOptions } from '@inertiajs/core'
import type { Action } from 'svelte/action'

interface ActionElement extends HTMLElement {
  href?: string
}

type ActionParameters = VisitOptions & { href?: string }

const link: Action<ActionElement, ActionParameters> = (node, options = {}) => {
  const [href, data] = hrefAndData(options)
  node.href = href
  options.data = data

  function fireEvent(name: string, eventOptions = {}) {
    return node.dispatchEvent(new CustomEvent(name, eventOptions))
  }

  function hrefAndData(options: ActionParameters) {
    return mergeDataIntoQueryString(
      options.method || 'get',
      node.href || options.href || '',
      options.data || ({} as any),
      options.queryStringArrayFormat || 'brackets',
    )
  }

  function visit(event: Event) {
    if (!node.href) {
      throw new Error('Option "href" is required')
    }

    if (shouldIntercept(event as KeyboardEvent)) {
      event.preventDefault()

      router.visit(node.href, {
        onCancelToken: () => fireEvent('cancel-token'),
        onBefore: (visit) => fireEvent('before', { detail: { visit } }),
        onStart: (visit) => fireEvent('start', { detail: { visit } }),
        onProgress: (progress) => fireEvent('progress', { detail: { progress } }),
        onFinish: (visit) => fireEvent('finish', { detail: { visit } }),
        onCancel: () => fireEvent('cancel'),
        onSuccess: (page) => fireEvent('success', { detail: { page } }),
        onError: (errors) => fireEvent('error', { detail: { errors } }),
        ...options,
      })
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

export default link
