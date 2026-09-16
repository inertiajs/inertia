import type MagicString from 'magic-string'

/** Replace generated scaffolding while retaining the original positions of an embedded expression. */
export function replaceWithSource(
  code: MagicString,
  start: number,
  end: number,
  replacement: string,
  source?: { start: number; end: number; offset: number },
): void {
  if (!source) {
    code.remove(start, end).appendLeft(start, replacement)
    return
  }

  code.remove(start, source.start).appendLeft(source.start, replacement.slice(0, source.offset))
  code.remove(source.end, end).appendRight(source.end, replacement.slice(source.offset + source.end - source.start))
}
