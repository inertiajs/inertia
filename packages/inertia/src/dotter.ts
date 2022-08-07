// This is basically split('.') but more thorough as it only splits valid dot notations and prevents splitting things like `foo...bar`
const dotSplit = (str: string) => str.match(/^\.+[^.]*|[^.]*\.+$|(?:\.{2,}|[^.])+(?:\.+$)?/g) || [str]

export const dotGet = (str: string, obj: Record<string, unknown>): unknown =>
  dotSplit(str)
    .reduce((obj: unknown, i): unknown => typeof obj === 'object' && obj !== null ? (obj as Record<string, unknown>)[i] : undefined, obj)

export const dotSet = (target: Record<string, unknown>, exp: string, value: unknown): void => {
  const levels = dotSplit(exp)
  const max_level = levels.length - 1
  levels.forEach(function (level, i) {
    if (i === max_level) {
      target[level] = value
    } else {
      if (typeof target[level] !== 'object' || target[level] === null) {
        target[level] = {}
      }
      target = target[level] as Record<string, unknown>
    }
  })
}
