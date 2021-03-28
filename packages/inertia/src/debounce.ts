// eslint-disable-next-line @typescript-eslint/ban-types
export default function debounce(fn: Function, delay: number): CallableFunction {
  let timeoutID: NodeJS.Timeout
  return function (... args: unknown[]) {
    clearTimeout(timeoutID)
    timeoutID = setTimeout(
      () => fn.apply(this, args),
      delay,
    )
  }
}
