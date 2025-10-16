function isContentEditableOrPrevented(event: KeyboardEvent | MouseEvent): boolean {
  return (event.target instanceof HTMLElement && event.target.isContentEditable) || event.defaultPrevented
}

/**
 * Determine if this mouse event should be intercepted for navigation purposes.
 * Links with modifier keys or non-left clicks should not be intercepted.
 * Content editable elements and prevented events are ignored.
 */
export function shouldIntercept(event: MouseEvent): boolean {
  const isLink = (event.currentTarget as HTMLElement).tagName.toLowerCase() === 'a'

  return !(
    isContentEditableOrPrevented(event) ||
    (isLink && event.altKey) ||
    (isLink && event.ctrlKey) ||
    (isLink && event.metaKey) ||
    (isLink && event.shiftKey) ||
    (isLink && 'button' in event && event.button !== 0)
  )
}

/**
 * Determine if this keyboard event should trigger a navigation request.
 * Enter triggers navigation for both links and buttons currently.
 * Space only triggers navigation for buttons specifically.
 */
export function shouldNavigate(event: KeyboardEvent): boolean {
  const isButton = (event.currentTarget as HTMLElement).tagName.toLowerCase() === 'button'

  return !isContentEditableOrPrevented(event) && (event.key === 'Enter' || (isButton && event.key === ' '))
}
