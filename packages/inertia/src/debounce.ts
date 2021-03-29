// eslint-disable-next-line @typescript-eslint/ban-types
export default function debounce(fn: Function, delay: number): VoidFunction {
  let timeoutID: NodeJS.Timeout
  return function (... args: unknown[]): void {
    clearTimeout(timeoutID)
    timeoutID = setTimeout(
      () => fn.apply(this, args),
      delay,
    )
  }
}
