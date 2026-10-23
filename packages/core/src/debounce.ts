export default function debounce<F extends (...params: any[]) => ReturnType<F>>(
  fn: F,
  delay: number,
): F & { cancel: () => void } {
  let timeoutID: NodeJS.Timeout

  const debounced = function (this: unknown, ...args: unknown[]) {
    clearTimeout(timeoutID)
    timeoutID = setTimeout(() => fn.apply(this, args), delay)
  } as F & { cancel: () => void }

  debounced.cancel = () => clearTimeout(timeoutID)

  return debounced
}
