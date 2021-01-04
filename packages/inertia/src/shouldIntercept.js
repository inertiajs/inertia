export default function shouldIntercept(event) {
  const isLink = event.currentTarget.tagName.toLowerCase() === 'a'
  return !(
    (event.target && event.target.isContentEditable)
    || event.defaultPrevented
    || (isLink && event.which > 1)
    || (isLink && event.altKey)
    || (isLink && event.ctrlKey)
    || (isLink && event.metaKey)
    || (isLink && event.shiftKey)
  )
}
