import { router } from '..'
import debounce from '../debounce'
import { useIntersectionObservers } from '../intersectionObservers'
import { UseInfiniteScrollElementManager } from '../types'

const INFINITE_SCROLL_PAGE_KEY = 'infiniteScrollPage'
const INFINITE_SCROLL_IGNORE_KEY = 'infiniteScrollIgnore'

type ElementRange = {
  from: number
  to: number
}

export const getPageFromElement = (element: HTMLElement): string | undefined =>
  element.dataset[INFINITE_SCROLL_PAGE_KEY]

export const useInfiniteScrollElementManager = (options: {
  shouldFetchNext: () => boolean
  shouldFetchPrevious: () => boolean
  getTriggerMargin: () => number
  getStartElement: () => HTMLElement
  getEndElement: () => HTMLElement
  getItemsElement: () => HTMLElement
  getScrollableParent: () => HTMLElement | null
  onPreviousTriggered: () => void
  onNextTriggered: () => void
  onItemIntersected: (element: HTMLElement) => void
  getPropName: () => string
}): UseInfiniteScrollElementManager => {
  const intersectionObservers = useIntersectionObservers()

  let itemsObserver: IntersectionObserver
  let startElementObserver: IntersectionObserver
  let endElementObserver: IntersectionObserver
  let itemsMutationObserver: MutationObserver
  let triggersEnabled = false

  const setupObservers = () => {
    // Watch for manually added DOM elements (not from server responses)
    // This mutation observer tracks when new elements are added to the slot,
    // so we can distinguish between user-added content and server-loaded pages
    itemsMutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType !== Node.ELEMENT_NODE) {
            return
          }

          addedElements.add(node as HTMLElement)
        })
      })

      rememberElementsDebounced()
    })

    itemsMutationObserver.observe(options.getItemsElement(), { childList: true })

    // Track individual items entering/leaving viewport for URL synchronization
    // When items become visible, we update the URL to reflect the current page
    itemsObserver = intersectionObservers.new((entry: IntersectionObserverEntry) =>
      options.onItemIntersected(entry.target as HTMLElement),
    )

    // Set up trigger zones at start/end that load more content when intersected. The rootMargin
    // creates a buffer zone so loading starts before user reaches the edge. We should always
    // have a root margin of at least 1px as our default elements have no height
    const observerOptions: IntersectionObserverInit = {
      root: options.getScrollableParent(),
      rootMargin: `${Math.max(1, options.getTriggerMargin())}px`,
    }

    startElementObserver = intersectionObservers.new(options.onPreviousTriggered, observerOptions)
    endElementObserver = intersectionObservers.new(options.onNextTriggered, observerOptions)
  }

  const enableTriggers = () => {
    if (triggersEnabled) {
      // Make sure we don't register multiple watchers
      disableTriggers()
    }

    const startElement = options.getStartElement()
    const endElement = options.getEndElement()

    if (startElement && options.shouldFetchPrevious()) {
      startElementObserver.observe(startElement)
    }

    if (endElement && options.shouldFetchNext()) {
      endElementObserver.observe(endElement)
    }

    triggersEnabled = true
  }

  const disableTriggers = () => {
    if (!triggersEnabled) {
      return
    }

    startElementObserver.disconnect()
    endElementObserver.disconnect()
    triggersEnabled = false
  }

  const refreshTriggers = () => {
    if (triggersEnabled) {
      enableTriggers()
    }
  }

  const flushAll = () => {
    disableTriggers()
    intersectionObservers.flushAll()
    itemsMutationObserver?.disconnect()
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

  let hasRestoredElements = false

  const processServerLoadedElements = (loadedPage: string | number | null) => {
    // On first run, try to restore the elements tags from browser history
    if (!hasRestoredElements) {
      hasRestoredElements = true

      if (restoreElements()) {
        return
      }
    }

    // Tag new server-loaded elements with their page number for URL management
    // This allows us to update the URL based on which page's content is most visible
    findUntaggedElements(options.getItemsElement()).forEach((element) => {
      if (elementIsUntagged(element)) {
        element.dataset[INFINITE_SCROLL_PAGE_KEY] = loadedPage?.toString() || '1'
      }

      itemsObserver.observe(element)
    })

    rememberElements()
  }

  const getElementsRememberKey = () => `inertia:infinite-scroll-elements:${options.getPropName()}`

  // Remember in browser history which elements belong to which page, so we can restore
  // them on back/forward navigation and keep URL synchronization working correctly
  const rememberElements = () => {
    const pageElementRange: Record<string, ElementRange> = {}
    const childNodes = options.getItemsElement().childNodes

    for (let index = 0; index < childNodes.length; index++) {
      const node = childNodes[index]

      if (node.nodeType !== Node.ELEMENT_NODE) {
        continue
      }

      const page = getPageFromElement(node as HTMLElement)

      if (typeof page === 'undefined') {
        continue
      }

      if (!(page in pageElementRange)) {
        pageElementRange[page] = { from: index, to: index }
      } else {
        pageElementRange[page].to = index
      }
    }

    router.remember(pageElementRange, getElementsRememberKey())
  }

  const rememberElementsDebounced = debounce(rememberElements, 250)

  const restoreElements = (): boolean => {
    const pageElementRange = router.restore(getElementsRememberKey()) as Record<string, ElementRange> | undefined

    if (!pageElementRange || typeof pageElementRange !== 'object') {
      return false
    }

    const childNodes = options.getItemsElement().childNodes

    // Use for loop instead of forEach for better performance
    for (let index = 0; index < childNodes.length; index++) {
      const node = childNodes[index]

      if (node.nodeType !== Node.ELEMENT_NODE) {
        continue
      }

      const element = node as HTMLElement

      // Find which page this element belongs to based on ranges
      let elementPage: string | undefined

      for (const [page, range] of Object.entries(pageElementRange)) {
        if (index >= range.from && index <= range.to) {
          elementPage = page
          break
        }
      }

      if (elementPage) {
        element.dataset[INFINITE_SCROLL_PAGE_KEY] = elementPage
      } else if (!elementIsUntagged(element)) {
        continue
      } else {
        element.dataset[INFINITE_SCROLL_IGNORE_KEY] = 'true'
      }

      itemsObserver.observe(element)
    }

    return true
  }

  return {
    setupObservers,
    enableTriggers,
    disableTriggers,
    refreshTriggers,
    flushAll,
    processManuallyAddedElements,
    processServerLoadedElements,
  }
}
