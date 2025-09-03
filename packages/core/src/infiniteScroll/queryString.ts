import debounce from '../debounce'
import { getElementsInViewportFromCollection } from '../domUtils'
import { router } from '../index'
import { getPageFromElement } from './elements'

/**
 * As users scroll through infinite content, this system updates the URL to reflect
 * which page they're currently viewing. It uses a "most visible page" calculation
 * so that the URL reflects whichever page has the most visible items.
 */
export const useInfiniteScrollQueryString = (options: {
  getPageName: () => string
  getSlotElement: () => HTMLElement
  shouldPreserveUrl: () => boolean
}) => {
  const slotChildren = () => [...options.getSlotElement().children] as HTMLElement[]

  // Debounced to avoid excessive URL updates during fast scrolling
  const onItemIntersected = debounce((itemElement: HTMLElement) => {
    if (options.shouldPreserveUrl() || !itemElement) {
      return
    }

    // Count how many items from each page are currently visible in the viewport
    const pageMap = new Map<string, number>()

    getElementsInViewportFromCollection(itemElement, slotChildren()).forEach((element) => {
      const page = getPageFromElement(element) ?? '1'

      if (pageMap.has(page)) {
        pageMap.set(page, pageMap.get(page)! + 1)
      } else {
        pageMap.set(page, 1)
      }
    })

    // Find the page with the most visible items - this becomes the "current" page
    const sortedPages = Array.from(pageMap.entries()).sort((a, b) => b[1] - a[1])
    const mostVisiblePage = sortedPages[0]?.[0]

    if (mostVisiblePage === undefined) {
      return
    }

    const url = new URL(window.location.href)

    // Clean URLs: don't show ?page=1 in the URL, just remove the parameter entirely
    if (mostVisiblePage === '1') {
      url.searchParams.delete(options.getPageName())
    } else {
      url.searchParams.set(options.getPageName(), mostVisiblePage.toString())
    }

    // Update URL without triggering a page reload or affecting scroll position
    router.replace({
      url: url.toString(),
      preserveScroll: true,
      preserveState: true,
    })
  }, 250)

  return {
    onItemIntersected,
  }
}
