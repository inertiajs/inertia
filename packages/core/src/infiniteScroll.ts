import { requestAnimationFrame } from './domUtils'
import { router } from './index'
import { useInfiniteScrollData } from './infiniteScroll/data'
import { useInfiniteScrollElementManager } from './infiniteScroll/elements'
import { useInfiniteScrollQueryString } from './infiniteScroll/queryString'
import { useInfiniteScrollPreservation } from './infiniteScroll/scrollPreservation'
import { Page, ReloadOptions, UseInfiniteScrollOptions, UseInfiniteScrollProps } from './types'

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
export default function useInfiniteScroll(options: UseInfiniteScrollOptions): UseInfiniteScrollProps {
  const queryStringManager = useInfiniteScrollQueryString({ ...options, getPageName: () => dataManager.getPageName() })

  // Create scroll preservation callbacks that capture and restore scroll position
  // and restore it after new content is prepended to maintain visual stability
  const scrollPreservation = useInfiniteScrollPreservation(options)

  const elementManager = useInfiniteScrollElementManager({
    ...options,
    // As items enter viewport, update URL to reflect the most visible page
    onItemIntersected: queryStringManager.onItemIntersected,
    onPreviousTriggered: () => dataManager.fetchPrevious(),
    onNextTriggered: () => dataManager.fetchNext(),
  })

  const dataManager = useInfiniteScrollData({
    ...options,
    // Before updating page data, tag any manually added DOM elements
    // so they don't get confused with server-loaded content
    onBeforeUpdate: elementManager.processManuallyAddedElements,
    // After successful request, tag new server content
    onCompletePreviousRequest: (loadedPage) => {
      options.onCompletePreviousRequest()
      requestAnimationFrame(() => elementManager.processServerLoadedElements(loadedPage), 2)
    },
    onCompleteNextRequest: (loadedPage) => {
      options.onCompleteNextRequest()
      requestAnimationFrame(() => elementManager.processServerLoadedElements(loadedPage), 2)
    },
    onReset: options.onDataReset,
  })

  const addScrollPreservationCallbacks = (reloadOptions: ReloadOptions): ReloadOptions => {
    const { captureScrollPosition, restoreScrollPosition } = scrollPreservation.createCallbacks()

    const originalOnBeforeUpdate = reloadOptions.onBeforeUpdate || (() => {})
    const originalOnSuccess = reloadOptions.onSuccess || (() => {})

    reloadOptions.onBeforeUpdate = (page: Page) => {
      originalOnBeforeUpdate(page)
      captureScrollPosition()
    }

    reloadOptions.onSuccess = (page: Page) => {
      originalOnSuccess(page)
      restoreScrollPosition()
    }

    return reloadOptions
  }

  const originalFetchNext = dataManager.fetchNext
  dataManager.fetchNext = (reloadOptions: ReloadOptions = {}) => {
    reloadOptions = { ...options.getReloadOptions?.(), ...reloadOptions }

    if (options.inReverseMode()) {
      reloadOptions = addScrollPreservationCallbacks(reloadOptions)
    }

    originalFetchNext(reloadOptions)
  }

  const originalFetchPrevious = dataManager.fetchPrevious
  dataManager.fetchPrevious = (reloadOptions: ReloadOptions = {}) => {
    reloadOptions = { ...options.getReloadOptions?.(), ...reloadOptions }

    if (!options.inReverseMode()) {
      reloadOptions = addScrollPreservationCallbacks(reloadOptions)
    }

    originalFetchPrevious(reloadOptions)
  }

  const removeEventListener = router.on('success', () => requestAnimationFrame(elementManager.refreshTriggers, 2))

  return {
    dataManager,
    elementManager,
    flush: () => {
      removeEventListener()
      dataManager.removeEventListener()
      elementManager.flushAll()
      queryStringManager.cancel()
    },
  }
}
