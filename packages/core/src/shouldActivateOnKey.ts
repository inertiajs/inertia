// The actual event passed to this function could be a native JavaScript event
// or a React synthetic event, so we are picking just the keys needed here (that
// are present in both types).

/**
 * Checks if the pressed key is an appropriate activation key for the
 * given element type, following web accessibility standards.
 *
 * By default, the Enter key can activate <a> with an href attribute and <button>
 * elements. Additionaly, the Space key is only expected to activate buttons.
 */
export default function shouldActivateOnKey(event: Pick<KeyboardEvent, 'key' | 'currentTarget'>): boolean {
  const isButton = (event.currentTarget as HTMLElement).tagName.toLowerCase() === 'button'

  return event.key === 'Enter' || (isButton && event.key === ' ')
}
