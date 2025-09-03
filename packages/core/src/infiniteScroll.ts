import { useInfiniteScrollData } from './infiniteScroll/data'
import { useInfiniteScrollElementManager } from './infiniteScroll/elements'
import { useInfiniteScrollQueryString } from './infiniteScroll/queryString'
import { useInfiniteScrollPreservation } from './infiniteScroll/scrollPreservation'
import { InfiniteScrollSide, UseInfiniteScrollOptions } from './types'

/**
 * Core infinite scroll composable that orchestrates data fetching, DOM management,
 * scroll preservation, and URL synchronization.
 *
 * This is the main entry point that coordinates four sub-systems:
 * - Data management: Handles pagination state and server requests
 * - Element management: DOM observation and intersection detection
 * - Query string sync: Updates URL as user scrolls through pages
 * - Scroll preservation: Maintains scroll position during content updates
 */
export default function useInfiniteScroll(options: UseInfiniteScrollOptions) {
  const queryStringManager = useInfiniteScrollQueryString(options)
  const scrollPreservation = useInfiniteScrollPreservation(options)

  const elementManager = useInfiniteScrollElementManager({
    ...options,
    onTopTriggered: () => {
      // Create scroll preservation callbacks that capture current scroll position
      // and restore it after new content is prepended to maintain visual stability
      const { onBeforeUpdate, onSuccess } = scrollPreservation.createCallbacks()

      dataManager.loadBefore({
        onBefore: () => options.onRequestStart('before'),
        onBeforeUpdate,
        onSuccess,
      })
    },
    onBottomTriggered: () =>
      dataManager.loadAfter({
        onBefore: () => options.onRequestStart('after'),
      }),
    // As items enter viewport, update URL to reflect the most visible page
    onItemIntersected: queryStringManager.onItemIntersected,
  })

  const dataManager = useInfiniteScrollData({
    ...options,
    // Before updating page data, tag any manually added DOM elements
    // so they don't get confused with server-loaded content
    onBeforeUpdate: elementManager.processManuallyAddedElements,
    onRequestComplete(_side: InfiniteScrollSide, lastLoadedPage?: string | number) {
      // After successful request, tag new server content
      elementManager.processServerLoadedElements(lastLoadedPage)
      options.onRequestComplete(_side)
    },
  })

  return {
    dataManager,
    elementManager,
  }
}
