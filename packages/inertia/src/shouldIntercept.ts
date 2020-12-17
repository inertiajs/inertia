export function shouldIntercept(event: KeyboardEvent) {
  if (event.currentTarget instanceof HTMLElement) {
    const isLink = event.currentTarget.tagName.toLowerCase() === 'a'
    if (event.target instanceof HTMLElement) {
      return !(
        (event.target && event.target.isContentEditable)
      || event.defaultPrevented
      || (isLink && event.which > 1) // TODO: Replace deprecated `which`
      || (isLink && event.altKey)
      || (isLink && event.ctrlKey)
      || (isLink && event.metaKey)
      || (isLink && event.shiftKey)
      )
    }
  }
  return false
}
