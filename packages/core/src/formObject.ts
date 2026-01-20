import { get, set } from 'lodash-es'
import { isFile } from './files'
import { FormDataConvertible } from './types'

/**
 * Transform dotted notation to bracket notation.
 *
 * Examples:
 *   user.name => user[name]
 *   user.profile.city => user[profile][city]
 *   user.skills[] => user[skills][]
 *   users.company[address].street => users[company][address][street]
 *   config\.app\.name => config.app.name (escaped, literal)
 */
function undotKey(key: string): string {
  if (!key.includes('.')) {
    return key
  }

  const transformSegment = (segment: string): string => {
    if (segment.startsWith('[') && segment.endsWith(']')) {
      return segment // Already in bracket notation - leave untouched
    }

    // Convert dotted segment to bracket notation: "user.name" → "user[name]"
    return segment.split('.').reduce((result, part, index) => (index === 0 ? part : `${result}[${part}]`))
  }

  return key
    .replace(/\\\./g, '__ESCAPED_DOT__') // Temporarily replace escaped dots (\.) to protect them from transformation
    .split(/(\[[^\]]*\])/) // Split on bracket notation while preserving the brackets in the result array
    .filter(Boolean) // Remove empty strings from the split operation
    .map(transformSegment) // Transform each segment: dotted parts become bracketed, existing brackets stay as-is
    .join('') // Reassemble all segments back into a single string
    .replace(/__ESCAPED_DOT__/g, '.') // Restore the escaped dots as literal dots in the final result
}

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
 * Set value in nested object, always creating objects (never arrays).
 * This ensures we can analyze the final structure before deciding what should be arrays.
 */
function setNestedObject(obj: Record<string, any>, path: string[], value: any): void {
  let current = obj

  for (let i = 0; i < path.length - 1; i++) {
    if (!(path[i] in current)) {
      current[path[i]] = {}
    }

    current = current[path[i]]
  }

  current[path[path.length - 1]] = value
}

/**
 * Check if an object has sequential numeric keys (0, 1, 2, ...).
 */
function objectHasSequentialNumericKeys(value: any): boolean {
  const keys = Object.keys(value)
  const numericKeys = keys
    .filter((k) => /^\d+$/.test(k))
    .map(Number)
    .sort((a, b) => a - b)

  return (
    keys.length === numericKeys.length &&
    numericKeys.length > 0 &&
    numericKeys[0] === 0 &&
    numericKeys.every((n, i) => n === i)
  )
}

/**
 * Convert objects with sequential numeric keys (0, 1, 2, ...) to arrays.
 */
function convertSequentialObjectsToArrays(value: any): any {
  if (Array.isArray(value)) {
    return value.map(convertSequentialObjectsToArrays)
  }

  if (typeof value !== 'object' || value === null || isFile(value)) {
    return value
  }

  if (objectHasSequentialNumericKeys(value)) {
    const result = []

    for (let i = 0; i < Object.keys(value).length; i++) {
      result[i] = convertSequentialObjectsToArrays(value[i])
    }

    return result
  }

  // Keep as object, recursively process values
  const result: Record<string, any> = {}

  for (const key in value) {
    result[key] = convertSequentialObjectsToArrays(value[key])
  }

  return result
}

/**
 * Convert a FormData instance into an object structure.
 */
export function formDataToObject(source: FormData): Record<string, FormDataConvertible> {
  const form: Record<string, any> = {}

  // formData.entries() returns an iterator where the first element is the key and the second element
  // is the value. Examples of the keys are "user[name]", "tags[]", "items[0][name]", "user.name", etc.
  // We should construct a new (nested) object based on these keys.
  for (const [key, value] of source.entries()) {
    if (value instanceof File && value.size === 0 && value.name === '') {
      // Check if the given value is an empty file. We want to filter
      // those out as they prevent us from comparing objects with
      // each other, which we do to set the isDirty prop.
      continue
    }

    const path = parseKey(undotKey(key))

    // If the key ends with an empty string (''), treat it as an array push (e.g., "tags[]")
    if (path[path.length - 1] === '') {
      const arrayPath = path.slice(0, -1)
      const existing = get(form, arrayPath)

      if (Array.isArray(existing)) {
        existing.push(value)
      } else if (existing && typeof existing === 'object' && !isFile(existing)) {
        // If existing is an object with numeric keys, convert to array (treating indices as relative)
        const numericKeys = Object.keys(existing)
          .filter((k) => /^\d+$/.test(k))
          .map(Number)
          .sort((a, b) => a - b)

        set(form, arrayPath, numericKeys.length > 0 ? [...numericKeys.map((k) => existing[k]), value] : [value])
      } else {
        set(form, arrayPath, [value])
      }

      continue
    }

    // Always build nested objects first, then convert sequential numeric keys to arrays.
    // This prevents the creation of sparse arrays when mixing numeric and string keys.
    setNestedObject(form, path.map(String), value)
  }

  // Convert objects with sequential numeric keys (0, 1, 2, ...) to arrays
  return convertSequentialObjectsToArrays(form)
}
