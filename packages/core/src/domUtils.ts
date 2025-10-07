const elementInViewport = (el: HTMLElement) => {
  const rect = el.getBoundingClientRect()

  // We check both vertically and horizontally for containers that scroll in either direction
  const verticallyVisible = rect.top < window.innerHeight && rect.bottom >= 0
  const horizontallyVisible = rect.left < window.innerWidth && rect.right >= 0

  return verticallyVisible && horizontallyVisible
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
  const upwardElements: HTMLElement[] = []
  const downwardElements: HTMLElement[] = []

  // Traverse upwards until an element is not visible
  for (let i = referenceIndex; i >= 0; i--) {
    const element = elements[i]

    if (elementInViewport(element)) {
      upwardElements.push(element)
    } else {
      break
    }
  }

  // Traverse downwards until an element is not visible
  for (let i = referenceIndex + 1; i < elements.length; i++) {
    const element = elements[i]

    if (elementInViewport(element)) {
      downwardElements.push(element)
    } else {
      break
    }
  }

  // Reverse upward elements to maintain DOM order, then append downward elements
  return [...upwardElements.reverse(), ...downwardElements]
}
