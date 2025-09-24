import { useIntersectionObservers } from '../intersectionObservers'
import { UseInfiniteScrollElementManager } from '../types'

const INFINITE_SCROLL_PAGE_KEY = 'infiniteScrollPage'
const INFINITE_SCROLL_IGNORE_KEY = 'infiniteScrollIgnore'

export const getPageFromElement = (element: HTMLElement): string | undefined =>
  element.dataset[INFINITE_SCROLL_PAGE_KEY]

export const useInfiniteScrollElementManager = (options: {
  getTrigger: () => 'start' | 'end' | 'both'
  getTriggerMargin: () => number
  getBeforeElement: () => HTMLElement
  getAfterElement: () => HTMLElement
  getSlotElement: () => HTMLElement
  getScrollableParent: () => HTMLElement | null
  onTopTriggered: () => void
  onBottomTriggered: () => void
  onItemIntersected: (element: HTMLElement) => void
}): UseInfiniteScrollElementManager => {
  const intersectionObservers = useIntersectionObservers()

  let itemsObserver: IntersectionObserver
  let topElementObserver: IntersectionObserver
  let bottomElementObserver: IntersectionObserver
  let slotMutationObserver: MutationObserver

  const setupObservers = () => {
    // Watch for manually added DOM elements (not from server responses)
    // This mutation observer tracks when new elements are added to the slot,
    // so we can distinguish between user-added content and server-loaded pages
    slotMutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            addedElements.add(node as HTMLElement)
          }
        })
      })
    })

    slotMutationObserver.observe(options.getSlotElement(), { childList: true })

    // Track individual items entering/leaving viewport for URL synchronization
    // When items become visible, we update the URL to reflect the current page
    itemsObserver = intersectionObservers.new(
      (entry: IntersectionObserverEntry) => options.onItemIntersected(entry.target as HTMLElement),
      { threshold: 0 },
    )

    // Set up trigger zones at top/bottom that load more content when intersected
    // The rootMargin creates a buffer zone so loading starts before user reaches the edge
    const observerOptions: IntersectionObserverInit = {
      root: options.getScrollableParent(),
      rootMargin: `${Math.max(1, options.getTriggerMargin())}px`,
    }

    topElementObserver = intersectionObservers.new(options.onTopTriggered, observerOptions)
    bottomElementObserver = intersectionObservers.new(options.onBottomTriggered, observerOptions)
  }

  const enableTriggers = () => {
    disableTriggers()

    const topElement = options.getBeforeElement()
    const bottomElement = options.getAfterElement()
    const trigger = options.getTrigger()

    if (topElement && trigger !== 'end') {
      topElementObserver.observe(topElement)
    }

    if (bottomElement && trigger !== 'start') {
      bottomElementObserver.observe(bottomElement)
    }
  }

  const disableTriggers = () => {
    topElementObserver.disconnect()
    bottomElementObserver.disconnect()
  }

  const flushAll = () => {
    intersectionObservers.flushAll()
    slotMutationObserver?.disconnect()
  }

  const addedElements = new Set<HTMLElement>()

  const elementIsUntagged = (element: HTMLElement): boolean =>
    !(INFINITE_SCROLL_PAGE_KEY in element.dataset) && !(INFINITE_SCROLL_IGNORE_KEY in element.dataset)

  const processManuallyAddedElements = () => {
    // Tag manually added elements so they don't interfere with URL management
    // These elements get marked as "ignore" since they weren't loaded from the server
    Array.from(addedElements).forEach((element) => {
      if (elementIsUntagged(element)) {
        element.dataset[INFINITE_SCROLL_IGNORE_KEY] = 'true'
      }

      itemsObserver.observe(element)
    })

    addedElements.clear()
  }

  const findUntaggedElements = (containerElement: HTMLElement): HTMLElement[] => {
    return Array.from(
      containerElement.querySelectorAll(
        `:scope > *:not([data-infinite-scroll-page]):not([data-infinite-scroll-ignore])`,
      ),
    )
  }

  const processServerLoadedElements = (currentPage?: string | number) => {
    // Tag new server-loaded elements with their page number for URL management
    // This allows us to update the URL based on which page's content is most visible
    findUntaggedElements(options.getSlotElement()).forEach((element) => {
      if (elementIsUntagged(element)) {
        element.dataset[INFINITE_SCROLL_PAGE_KEY] = currentPage?.toString() || '1'
      }

      itemsObserver.observe(element)
    })
  }

  return {
    setupObservers,
    enableTriggers,
    disableTriggers,
    flushAll,
    processManuallyAddedElements,
    processServerLoadedElements,
  }
}
