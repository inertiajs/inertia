const elementInViewport = (el: HTMLElement) => {
  const rect = el.getBoundingClientRect()
  return rect.top < window.innerHeight && rect.bottom >= 0
}

export const getScrollableParent = (element: HTMLElement | null): HTMLElement | null => {
  let parent = element?.parentElement

  while (parent) {
    const overflowY = window.getComputedStyle(parent).overflowY

    if (overflowY === 'auto' || overflowY === 'scroll') {
      return parent
    }

    parent = parent.parentElement
  }

  return null
}

export const getElementsInViewportFromCollection = (
  referenceElement: HTMLElement,
  elements: HTMLElement[],
): HTMLElement[] => {
  const referenceIndex = elements.indexOf(referenceElement)
  const visibleElements: HTMLElement[] = []

  // Traverse upwards until an element is not visible
  for (let i = referenceIndex; i >= 0; i--) {
    const element = elements[i]

    if (elementInViewport(element)) {
      visibleElements.push(element)
    } else {
      break
    }
  }

  // Traverse downwards until an element is not visible
  for (let i = referenceIndex + 1; i < elements.length; i++) {
    const element = elements[i]

    if (elementInViewport(element)) {
      visibleElements.push(element)
    } else {
      break
    }
  }

  return visibleElements
}
