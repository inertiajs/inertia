import {
  mergeDataIntoQueryString,
  router,
  shouldIntercept,
  type ActiveVisit,
  type CacheForOption,
  type Errors,
  type FormDataConvertible,
  type LinkPrefetchOption,
  type Method,
  type Page,
  type PendingVisit,
  type Progress,
  type VisitOptions,
} from '@inertiajs/core'
import type { ActionReturn } from 'svelte/action'

interface ActionElement extends HTMLElement {
  href?: string
}

type ActionParameters = VisitOptions & {
  href?: string,
  data?: Record<string, FormDataConvertible>,
  cacheFor?: CacheForOption | CacheForOption[],
  prefetch?: boolean | LinkPrefetchOption | LinkPrefetchOption[],
}

interface ActionAttributes {
  'on:start'?: CustomEvent<{ visit: PendingVisit }>
  'on:progress'?: CustomEvent<{ progress: Progress | undefined }>
  'on:finish'?: CustomEvent<{ visit: ActiveVisit }>
  'on:before'?: CustomEvent<{ visit: PendingVisit }>
  'on:cancel'?: CustomEvent
  'on:success'?: CustomEvent<{ page: Page }>
  'on:error'?: CustomEvent<{ errors: Errors }>
  'on:cancel-token'?: CustomEvent
}

type ActionEventHandlers = {
  [K in keyof HTMLElementEventMap]?: (event: HTMLElementEventMap[K]) => void
}

function link(node: ActionElement, initialParams: ActionParameters = {}): ActionReturn<ActionParameters, ActionAttributes> {
  let inFlightCount = 0
  let hoverTimeout: NodeJS.Timeout

  // Variables initialized and updated by the "update" function
  let prefetchModes: LinkPrefetchOption[] = []
  let cacheForValue: CacheForOption | CacheForOption[]
  let method: Method
  let href: string
  let data
  let baseParams: VisitOptions
  let visitParams: VisitOptions

  const regularEvents: ActionEventHandlers = {
    click: (event) => {
      if (shouldIntercept(event)) {
        event.preventDefault()
        router.visit(href, visitParams)
      }
    },
  }

  const prefetchHoverEvents: ActionEventHandlers = {
    mouseenter: () => hoverTimeout = setTimeout(() => prefetch(), 75),
    mouseleave: () => clearTimeout(hoverTimeout),
    click: regularEvents.click,
  }

  const prefetchClickEvents: ActionEventHandlers = {
    mousedown: (event) => {
      if (shouldIntercept(event)) {
        event.preventDefault()
        prefetch()
      }
    },
    mouseup: (event) => {
      event.preventDefault()
      router.visit(href, visitParams)
    },
    click: (event) => {
      if (shouldIntercept(event)) {
        // Let the mouseup event handle the visit
        event.preventDefault()
      }
    },
  }

  function update({ cacheFor = 0, prefetch = false, ...newParams }: ActionParameters) {
    prefetchModes = (() => {
      if (prefetch === true) {
        return ['hover']
      }

      if (prefetch === false) {
        return []
      }

      if (Array.isArray(prefetch)) {
        return prefetch
      }

      return [prefetch]
    })()

    cacheForValue = (() => {
      if (cacheFor !== 0) {
        // If they've provided a value, respect it
        return cacheFor
      }

      if (prefetchModes.length === 1 && prefetchModes[0] === 'click') {
        // If they've only provided a prefetch mode of 'click',
        // we should only prefetch for the next request but not keep it around
        return 0
      }

      // Otherwise, default to 30 seconds
      return 30_000
    })()

    method = (newParams.method?.toLowerCase() || 'get') as Method
    [href, data] = hrefAndData(method, newParams)

    if (node.tagName === 'A') {
      node.href = href
    }

    baseParams = {
      data: data,
      method: method,
      replace: newParams.replace || false,
      preserveScroll: newParams.preserveScroll || false,
      preserveState: newParams.preserveState ?? method !== 'get',
      only: newParams.only || [],
      except: newParams.except || [],
      headers: newParams.headers || {},
      async: newParams.async || false,
    }
    
    visitParams = {
      ...baseParams,
      onStart: (visit) => {
        inFlightCount++
        updateNodeAttributes()
        dispatchEvent('start', { detail: { visit } })
      },
      onProgress: (progress) => dispatchEvent('progress', { detail: { progress } }),
      onFinish: (visit) => {
        inFlightCount--
        updateNodeAttributes()
        dispatchEvent('finish', { detail: { visit } })
      },
      onBefore: (visit) => dispatchEvent('before', { detail: { visit } }),
      onCancel: () => dispatchEvent('cancel'),
      onSuccess: (page) => dispatchEvent('success', { detail: { page } }),
      onError: (errors) => dispatchEvent('error', { detail: { errors } }),
      onCancelToken: () => dispatchEvent('cancel-token'),
    }

    updateEventListeners()
  }

  function dispatchEvent(type: string, detail = {}) {
    return node.dispatchEvent(new CustomEvent(type, detail))
  }

  function hrefAndData(method: Method, params: ActionParameters) {
    return mergeDataIntoQueryString(
      method,
      node.href || params.href || '',
      params.data || {},
      params.queryStringArrayFormat || 'brackets',
    )
  }

  function prefetch() {
    router.prefetch(href, baseParams, { cacheFor: cacheForValue })
  }

  function updateNodeAttributes() {
    if (inFlightCount > 0) {
      node.setAttribute('data-loading', '')
      return
    }

    node.removeAttribute('data-loading')
  }

  function updateEventListeners() {
    removeEventListeners()

    if (prefetchModes.includes('hover')) {
      addEventListeners(prefetchHoverEvents)
      return
    }
    
    if (prefetchModes.includes('click')) {
      addEventListeners(prefetchClickEvents)
      return
    }

    addEventListeners(regularEvents)
  }

  function addEventListeners(eventHandlers: ActionEventHandlers) {
    Object.entries(eventHandlers).forEach(([event, handler]) => {
      node.addEventListener(event as keyof HTMLElementEventMap, handler as EventListener)
    })
  }

  function removeEventListeners() {
    [prefetchHoverEvents, prefetchClickEvents, regularEvents].forEach((eventHandlers) => {
      Object.entries(eventHandlers).forEach(([event, handler]) => {
        node.removeEventListener(event as keyof HTMLElementEventMap, handler as EventListener)
      })
    })
  }

  function destroy() {
    clearTimeout(hoverTimeout)
    removeEventListeners()
  }

  update(initialParams)

  if (prefetchModes.includes('mount')) {
    prefetch()
  }

  return { update, destroy }
}

export default link
