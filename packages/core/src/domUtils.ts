const elementInViewport = (el: HTMLElement) => {
  const rect = el.getBoundingClientRect()
  return rect.top < window.innerHeight && rect.bottom >= 0
}

export const getElementsInViewportFromCollection = (
  referenceElement: HTMLElement,
  elementCollection: HTMLCollection,
): HTMLElement[] => {
  const children = [...elementCollection] as HTMLElement[]
  const referenceIndex = children.indexOf(referenceElement)
  const visibleItems: HTMLElement[] = []

  // Traverse upwards until an item is not visible
  for (let i = referenceIndex; i >= 0; i--) {
    const child = children[i]

    if (elementInViewport(child)) {
      visibleItems.push(child)
    } else {
      break
    }
  }

  // Traverse downwards until an item is not visible
  for (let i = referenceIndex + 1; i < children.length; i++) {
    const child = children[i]

    if (elementInViewport(child)) {
      visibleItems.push(child)
    } else {
      break
    }
  }

  return visibleItems
}
