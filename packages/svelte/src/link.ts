import {
  mergeDataIntoQueryString,
  router,
  shouldIntercept,
  type FormDataConvertible,
  type GlobalEventsMap,
  type VisitOptions,
} from '@inertiajs/core'
import type { CancelTokenSource } from 'axios'
import type { ActionReturn } from 'svelte/action'

interface ActionElement extends HTMLElement {
  href?: string
}

type ActionParameters = Omit<VisitOptions, 'data'> & {
  href?: string
  data?: Record<string, FormDataConvertible>
}

type SelectedEventKeys = 'start' | 'progress' | 'finish' | 'before' | 'cancel' | 'success' | 'error'
type SelectedGlobalEventsMap = Pick<GlobalEventsMap, SelectedEventKeys>
type ActionAttributes = {
  [K in keyof SelectedGlobalEventsMap as `on:${K}` | `on${K}`]?: (
    event: CustomEvent<SelectedGlobalEventsMap[K]['details']>,
  ) => void
} & {
  'on:cancel-token'?: (event: CustomEvent<CancelTokenSource>) => void
  oncanceltoken?: (event: CustomEvent<CancelTokenSource>) => void
}

function link(node: ActionElement, options: ActionParameters = {}): ActionReturn<ActionParameters, ActionAttributes> {
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
        onCancelToken: (token) => fireEvent('cancel-token', { detail: { token } }),
        onBefore: (visit) => fireEvent('before', { cancelable: true, detail: { visit } }),
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
