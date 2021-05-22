export default function shouldIntercept(event: KeyboardEvent): boolean {
  const isLink = (event.currentTarget as HTMLElement).tagName.toLowerCase() === 'a'
  return !(
    (event.target && (event?.target as HTMLElement).isContentEditable) ||
    event.defaultPrevented ||
    (isLink && event.which > 1) ||
    (isLink && event.altKey) ||
    (isLink && event.ctrlKey) ||
    (isLink && event.metaKey) ||
    (isLink && event.shiftKey)
  )
}
