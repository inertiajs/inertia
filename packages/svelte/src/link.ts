import {
  mergeDataIntoQueryString,
  router,
  shouldIntercept,
  type CacheForOption,
  type LinkPrefetchOption,
  type Method,
  type VisitOptions,
} from '@inertiajs/core'
import type { Action } from 'svelte/action'

interface ActionElement extends HTMLElement {
  href?: string
}

type ActionParameters = VisitOptions & { href?: string, cacheFor?: CacheForOption | CacheForOption[] }
type ActionNodeEvents = {
  [K in keyof HTMLElementEventMap]?: (event: HTMLElementEventMap[K]) => void
}

const defaults: Partial<ActionParameters> = {
  method: 'get',
  replace: false,
  preserveScroll: false,
  preserveState: false,
  only: [],
  except: [],
  headers: {},
  queryStringArrayFormat: 'brackets',
  async: false,
  prefetch: false,
  cacheFor: 0,
}

const link: Action<ActionElement, ActionParameters> = (node, options = {}) => {
  let inFlightCount = 0
  let hoverTimeout: NodeJS.Timeout

  options = { ...defaults, ...options }

  // console.log('link mounted', options)

  const prefetchModes: LinkPrefetchOption[] = (() => {
    if (options.prefetch === true) {
      return ['hover']
    }

    if (options.prefetch === false) {
      return []
    }

    if (Array.isArray(options.prefetch)) {
      return options.prefetch
    }

    return [options.prefetch]
  })()

  const cacheForValue = (() => {
    if (options.cacheFor !== 0) {
      // If they've provided a value, respect it
      return options.cacheFor
    }

    if (prefetchModes.length === 1 && prefetchModes[0] === 'click') {
      // If they've only provided a prefetch mode of 'click',
      // we should only prefetch for the next request but not keep it around
      return 0
    }

    // Otherwise, default to 30 seconds
    return 30_000
  })()

  const method = (options.method?.toLocaleLowerCase() || 'get') as Method
  const [href, data] = hrefAndData(method, options)
  node.href = href
  options.method = method
  options.data = data
  // options.preserveState = options.preserveState ?? method !== 'get',

  if (prefetchModes.includes('mount')) {
    prefetch()
  }

  // TODO: Reevaluate this when options change
  const visitParams = {
    ...options,
    onCancelToken: () => fireEvent('cancel-token'),
    onBefore: (visit) => fireEvent('before', { detail: { visit } }),
    onStart: (visit) => {
      inFlightCount++
      // TODO: 'data-loading': inFlightCount.value > 0 ? '' : undefined,
      fireEvent('start', { detail: { visit } })
    },
    onProgress: (progress) => fireEvent('progress', { detail: { progress } }),
    onFinish: (visit) => {
      inFlightCount--
      // TODO: 'data-loading': inFlightCount.value > 0 ? '' : undefined,
      fireEvent('finish', { detail: { visit } })
    },
    onCancel: () => fireEvent('cancel'),
    onSuccess: (page) => fireEvent('success', { detail: { page } }),
    onError: (errors) => fireEvent('error', { detail: { errors } }),
  }

  function fireEvent(name: string, eventOptions = {}) {
    return node.dispatchEvent(new CustomEvent(name, eventOptions))
  }

  function hrefAndData(method: Method, options: ActionParameters) {
    return mergeDataIntoQueryString(
      method,
      node.href || options.href || '',
      options.data || ({} as any),
      options.queryStringArrayFormat || 'brackets',
    )
  }

  function prefetch() {
    console.log('prefetching...', { cacheFor: cacheForValue }, prefetchModes)
    router.prefetch(href, options, { cacheFor: cacheForValue })
  }

  // TODO: Decide where to put this...
  // if (!node.href) {
  //   throw new Error('Option "href" is required')
  // }

  const regularEvents: ActionNodeEvents = {
    click: (event) => {
      if (shouldIntercept(event)) {
        event.preventDefault()
        console.log('regular click', visitParams)
        router.visit(href, visitParams)
      }
    },
  }

  const prefetchHoverEvents: ActionNodeEvents = {
    mouseenter: () => hoverTimeout = setTimeout(() => prefetch(), 75),
    mouseleave: () => clearTimeout(hoverTimeout),
    click: regularEvents.click,
  }

  const prefetchClickEvents: ActionNodeEvents = {
    mousedown: (event) => {
      if (shouldIntercept(event)) {
        event.preventDefault()
        prefetch()
      }
    },
    mouseup: (event) => {
      event.preventDefault()
      console.log('prefetchClickEvents click', visitParams)
      router.visit(href, visitParams)
    },
    click: (event) => {
      if (shouldIntercept(event)) {
        // Let the mouseup event handle the visit
        event.preventDefault()
      }
    },
  }

  // TODO: Remove/add event listeners when options change
  if (prefetchModes.includes('hover')) {
    Object.entries(prefetchHoverEvents).forEach(([event, handler]) => {
      node.addEventListener(event as keyof HTMLElementEventMap, handler as EventListener)
    })
  } else if (prefetchModes.includes('click')) {
    Object.entries(prefetchClickEvents).forEach(([event, handler]) => {
      node.addEventListener(event as keyof HTMLElementEventMap, handler as EventListener)
    })
  } else {
    Object.entries(regularEvents).forEach(([event, handler]) => {
      node.addEventListener(event as keyof HTMLElementEventMap, handler as EventListener)
    })
  }

  return {
    update(newOptions) {
      const [href, data] = hrefAndData(newOptions)
      node.href = href
      options = { ...defaults, ...newOptions, data }
      // TODO: Reevaluate prefetchModes and cacheForValue
      // TODO: Remove/add event listeners
    },
    destroy() {
      clearTimeout(hoverTimeout)
      // TODO: remove event listeners
      // node.removeEventListener('click', visit)
    },
  }
}

export default link
