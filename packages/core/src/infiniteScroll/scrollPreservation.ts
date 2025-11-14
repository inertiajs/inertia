import { getElementsInViewportFromCollection } from '../domUtils'

/**
 * When loading content "before" the current viewport (e.g. loading page 1 when viewing page 2),
 * new content is prepended to the DOM, which naturally pushes existing content down and
 * disrupts the user's scroll position. This system maintains visual stability by:
 *
 * 1. Capturing a reference element and its position before the update
 * 2. After new content is added, calculating how far that reference element moved
 * 3. Adjusting scroll position to keep the reference element in the same visual location
 */
export const useInfiniteScrollPreservation = (options: {
  getScrollableParent: () => HTMLElement | null
  getItemsElement: () => HTMLElement
}) => {
  const createCallbacks = () => {
    let currentScrollTop: number
    let referenceElement: Element | null = null
    let referenceElementTop: number = 0

    const captureScrollPosition = () => {
      const scrollableContainer = options.getScrollableParent()
      const itemsElement = options.getItemsElement()

      // Capture current scroll position
      currentScrollTop = scrollableContainer?.scrollTop || window.scrollY

      // Find the first visible element to use as a reference point
      // This element will help us calculate how much the content shifted after the update
      const visibleElements = getElementsInViewportFromCollection([...itemsElement.children] as HTMLElement[])

      if (visibleElements.length > 0) {
        referenceElement = visibleElements[0]
        const containerRect = scrollableContainer?.getBoundingClientRect() || { top: 0 }
        const containerTop = scrollableContainer ? containerRect.top : 0
        const rect = referenceElement.getBoundingClientRect()
        // Store the reference element's position relative to its container
        referenceElementTop = rect.top - containerTop
      }
    }

    const restoreScrollPosition = () => {
      if (!referenceElement) {
        return
      }

      let attempts = 0
      let restored = false

      const restore = () => {
        attempts++

        if (restored || attempts > 10) {
          return false
        }

        // Calculate where our reference element ended up after new content was prepended
        const scrollableContainer = options.getScrollableParent()
        const containerRect = scrollableContainer?.getBoundingClientRect() || { top: 0 }
        const containerTop = scrollableContainer ? containerRect.top : 0
        const newRect = referenceElement!.getBoundingClientRect()
        const newElementTop = newRect.top - containerTop

        // Calculate how much the reference element moved due to content being prepended
        const adjustment = newElementTop - referenceElementTop

        if (adjustment === 0) {
          // Try again on the next frame, as DOM may still be updating
          window.requestAnimationFrame(restore)
          return
        }

        // Adjust scroll position to compensate for the movement, keeping the reference element
        // in the same visual position as before the update
        if (scrollableContainer) {
          scrollableContainer.scrollTo({ top: currentScrollTop + adjustment })
        } else {
          window.scrollTo(0, window.scrollY + adjustment)
        }

        restored = true
      }

      window.requestAnimationFrame(restore)
    }

    return {
      captureScrollPosition,
      restoreScrollPosition,
    }
  }

  return {
    createCallbacks,
  }
}
