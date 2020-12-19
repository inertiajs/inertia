export default function debounce(fn, delay) {
  let timeoutID = null
  return function () {
    clearTimeout(timeoutID)
    timeoutID = setTimeout(() => fn.apply(this, arguments), delay)
  }
}
