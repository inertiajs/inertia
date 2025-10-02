import { router } from '..'
import debounce from '../debounce'
import { getElementsInViewportFromCollection } from '../domUtils'
import Queue from './../queue'
import { getPageFromElement } from './elements'

// Shared queue among all instances to ensure URL updates are processed sequentially
const queue = new Queue<Promise<void>>()

/**
 * As users scroll through infinite content, this system updates the URL to reflect
 * which page they're currently viewing. It uses a "most visible page" calculation
 * so that the URL reflects whichever page has the most visible items.
 */
export const useInfiniteScrollQueryString = (options: {
  getPageName: () => string
  getItemsElement: () => HTMLElement
  shouldPreserveUrl: () => boolean
}) => {
  let enabled = true

  const queuePageUpdate = (page: string) => {
    queue.add(() => {
      return new Promise((resolve) => {
        if (!enabled) {
          return resolve()
        }

        const pageName = options.getPageName()
        const url = new URL(window.location.href)

        // Clean URLs: don't show ?page=1 in the URL, just remove the parameter entirely
        if (page === '1') {
          url.searchParams.delete(pageName)
        } else {
          url.searchParams.set(pageName, page)
        }

        // Update URL without triggering a page reload or affecting scroll position
        router.replace({
          url: url.toString(),
          preserveScroll: true,
          preserveState: true,
          onFinish: () => {
            resolve()
          },
        })
      })
    })
  }

  // Debounced to avoid excessive URL updates during fast scrolling
  const onItemIntersected = debounce((itemElement: HTMLElement) => {
    const itemsElement = options.getItemsElement()

    if (!enabled || options.shouldPreserveUrl() || !itemElement || !itemsElement) {
      return
    }

    // Count how many items from each page are currently visible in the viewport
    const pageMap = new Map<string, number>()
    const elements = [...itemsElement.children] as HTMLElement[]

    getElementsInViewportFromCollection(itemElement, elements).forEach((element) => {
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

    if (mostVisiblePage !== undefined) {
      queuePageUpdate(mostVisiblePage)
    }
  }, 250)

  return {
    onItemIntersected,
    cancel: () => (enabled = false),
  }
}
