/**
 * Determine if this mouse event should be intercepted for navigation purposes.
 * Links with modifier keys or non-left clicks should not be intercepted.
 * Content editable elements and prevented events are ignored.
 */
export function shouldIntercept(
  event: Pick<
    MouseEvent,
    'altKey' | 'ctrlKey' | 'defaultPrevented' | 'target' | 'currentTarget' | 'metaKey' | 'shiftKey' | 'button'
  >,
): boolean {
  const isLink = (event.currentTarget as HTMLElement).tagName.toLowerCase() === 'a'

  return !(
    (event.target && (event?.target as HTMLElement).isContentEditable) ||
    event.defaultPrevented ||
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
export function shouldNavigate(event: Pick<KeyboardEvent, 'key' | 'currentTarget'>): boolean {
  const isButton = (event.currentTarget as HTMLElement).tagName.toLowerCase() === 'button'

  return event.key === 'Enter' || (isButton && event.key === ' ')
}
