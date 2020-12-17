export function debounce<F extends (...args: any[]) => any>(fn: F, delay: number) {
  let timeoutID: number
  return (...args: Parameters<F>) => {
    clearTimeout(timeoutID)
    timeoutID = setTimeout(() => fn.apply(this, args), delay) as any
  }
}