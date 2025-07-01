import { get, set } from 'es-toolkit/compat'
import { FormDataConvertible } from './types'

/**
 * Parse a key into an array of path segments.
 *
 * Examples:
 * - "user[name]" => ["user", "name"]
 * - "tags[]" => ["tags", ""]
 * - "items[0][name]" => ["items", 0, "name"]
 */
function parseKey(key: string): (string | number | '')[] {
  const path: (string | number | '')[] = []
  const pattern = /([^\[\]]+)|\[(\d*)\]/g
  let match: RegExpExecArray | null

  while ((match = pattern.exec(key)) !== null) {
    if (match[1] !== undefined) {
      path.push(match[1])
    } else if (match[2] !== undefined) {
      path.push(match[2] === '' ? '' : Number(match[2]))
    }
  }

  return path
}

/**
 * Convert a FormData instance into an object structure.
 */
export function formDataToObject(source: FormData): Record<string, FormDataConvertible> {
  const form: Record<string, any> = {}

  // formData.entries() returns an iterator where the first element is the key and the second is the value.
  // Examples of the keys are "user[name]", "tags[]", "items[0][name]", etc.
  for (const [key, value] of source.entries()) {
    if (value instanceof File && value.size === 0 && value.name === '') {
      // Check if the given value is an empty file.
      continue
    }

    const path = parseKey(key)

    // If key ends with "", treat as array push as this is something like "tags[]"
    if (path[path.length - 1] === '') {
      const arrayPath = path.slice(0, -1)
      const existing = get(form, arrayPath)

      if (Array.isArray(existing)) {
        existing.push(value)
      } else {
        set(form, arrayPath, [value])
      }

      continue
    }

    // No brackets: last value wins
    set(form, path, value)
  }

  return form
}
