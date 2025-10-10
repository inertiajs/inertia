const elementInViewport = (el: HTMLElement) => {
  const rect = el.getBoundingClientRect()

  // We check both vertically and horizontally for containers that scroll in either direction
  const verticallyVisible = rect.top < window.innerHeight && rect.bottom >= 0
  const horizontallyVisible = rect.left < window.innerWidth && rect.right >= 0

  return verticallyVisible && horizontallyVisible
}

export const getScrollableParent = (element: HTMLElement | null): HTMLElement | null => {
  const allowsVerticalScroll = (el: HTMLElement): boolean => {
    const computedStyle = window.getComputedStyle(el)

    if (['scroll', 'overlay'].includes(computedStyle.overflowY)) {
      return true
    }

    if (computedStyle.overflowY !== 'auto') {
      return false
    }

    if (['visible', 'clip'].includes(computedStyle.overflowX)) {
      return true
    }

    return hasDimensionConstraint(computedStyle.maxHeight, el.style.height)
  }

  const allowsHorizontalScroll = (el: HTMLElement): boolean => {
    const computedStyle = window.getComputedStyle(el)

    if (['scroll', 'overlay'].includes(computedStyle.overflowX)) {
      return true
    }

    if (computedStyle.overflowX !== 'auto') {
      return false
    }

    if (['visible', 'clip'].includes(computedStyle.overflowY)) {
      return true
    }

    return hasDimensionConstraint(computedStyle.maxWidth, el.style.width)
  }

  const hasDimensionConstraint = (computedMaxDimension: string, inlineStyleDimension: string): boolean => {
    if (computedMaxDimension && computedMaxDimension !== 'none' && computedMaxDimension !== '0px') {
      return true
    }

    if (inlineStyleDimension && inlineStyleDimension !== 'auto' && inlineStyleDimension !== '0') {
      return true
    }

    return false
  }

  let parent = element?.parentElement

  while (parent) {
    const allowsScroll = allowsVerticalScroll(parent) || allowsHorizontalScroll(parent)

    if (window.getComputedStyle(parent).display !== 'contents' && allowsScroll) {
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
