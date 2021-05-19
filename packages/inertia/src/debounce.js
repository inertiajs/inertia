export default function debounce(fn, delay) {
  let timeoutID = null
  let debouncedFn = function () {
    clearTimeout(timeoutID)
    timeoutID = setTimeout(() => fn.apply(this, arguments), delay)
  }
  debouncedFn.cancel = function () {
    clearTimeout(timeoutID)
  }
  return debouncedFn
}
