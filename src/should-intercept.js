export default function shouldIntercept(event) {
  return !(
    (event.target && event.target.isContentEditable)
    || event.defaultPrevented
    || event.which > 1
    || event.altKey
    || event.ctrlKey
    || event.metaKey
    || event.shiftKey
  )
}
