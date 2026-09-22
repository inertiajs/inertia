import type MagicString from 'magic-string'

/**
 * Replace a range with generated code, keeping surrounding original positions intact.
 * Accepts an empty range so generated code can be spliced around a preserved expression.
 */
export function replaceRange(code: MagicString, start: number, end: number, replacement: string): void {
  if (start < end) {
    code.remove(start, end)
  }

  code.appendLeft(start, replacement)
}
