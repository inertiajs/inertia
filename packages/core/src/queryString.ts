import type { QueryStringArrayFormatOption } from './types'

/**
 * Parse a query string into a nested object.
 */
export function parse(query: string): Record<string, unknown> {
  if (!query || query === '?') {
    return {}
  }

  const result: Record<string, unknown> = {}

  query
    .replace(/^\?/, '')
    .split('&')
    .filter(Boolean)
    .forEach((segment) => {
      const [rawKey, rawValue] = splitPair(segment)

      set(result, decode(rawKey), decode(rawValue))
    })

  return result
}

/**
 * Convert an object to a query string.
 */
export function stringify(data: Record<string, unknown>, arrayFormat: QueryStringArrayFormatOption): string {
  const pairs: string[] = []

  build(data, '', pairs, arrayFormat)

  return pairs.length ? '?' + pairs.join('&') : ''
}

/**
 * Split a query string pair into key and value.
 */
function splitPair(pair: string): [string, string] {
  const index = pair.indexOf('=')

  return index === -1 ? [pair, ''] : [pair.substring(0, index), pair.substring(index + 1)]
}

/**
 * Decode a query string component.
 */
function decode(value: string): string {
  // "hello+world" -> "hello world" (+ is a legacy space encoding from forms)
  return decodeURIComponent(value.replace(/\+/g, ' '))
}

/**
 * Set an item on an object using bracket notation.
 */
function set(target: Record<string, unknown>, key: string, value: string): void {
  // "user[profile][name]" -> ["user", "profile", "name"]
  const keys = parseKey(key)

  let current = target

  while (keys.length > 1) {
    const segment = keys.shift()!
    const nextIsArrayPush = keys[0] === ''

    // If the key doesn't exist at this depth, we will just create an empty
    // array or object to hold the next value, allowing us to create the
    // structures to hold final values at the correct depth.
    // "tags[]" needs an array, "user[profile]" needs an object.
    if (typeof current[segment] !== 'object' || current[segment] === null) {
      current[segment] = nextIsArrayPush ? [] : {}
    }

    current = current[segment] as Record<string, unknown>
  }

  const final = keys.shift()!

  // "tags[]=vue&tags[]=react" pushes to array: { tags: ["vue", "react"] }
  // "user[name]=John" sets on object: { user: { name: "John" } }
  if (final === '' && Array.isArray(current)) {
    current.push(value)
  } else {
    current[final] = value
  }
}

/**
 * Parse a bracket notation key into segments.
 */
function parseKey(key: string): string[] {
  const segments: string[] = []

  // "filters[status]" -> base is "filters"
  const base = key.split('[')[0]

  if (base) {
    segments.push(base)
  }

  // "user[profile][name]" -> ["user", "profile", "name"]
  // "tags[]" -> ["tags", ""] (empty string indicates array push)
  let match
  const pattern = /\[([^\]]*)\]/g

  while ((match = pattern.exec(key)) !== null) {
    segments.push(match[1])
  }

  return segments
}

/**
 * Recursively build query string pairs from a value.
 */
function build(value: unknown, prefix: string, pairs: string[], arrayFormat: QueryStringArrayFormatOption): void {
  // { cleared: undefined } -> key is omitted entirely
  if (value === undefined) {
    return
  }

  // { cleared: null } -> "cleared=" (empty value, key preserved)
  if (value === null) {
    pairs.push(`${prefix}=`)
    return
  }

  // { tags: ["vue", "react"] } -> "tags[]=vue&tags[]=react" (brackets)
  //                            -> "tags[0]=vue&tags[1]=react" (indices)
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      const key = arrayFormat === 'indices' ? `${prefix}[${index}]` : `${prefix}[]`

      build(item, key, pairs, arrayFormat)
    })
    return
  }

  // { user: { name: "John" } } -> "user[name]=John"
  if (typeof value === 'object') {
    Object.keys(value).forEach((key) => {
      build((value as Record<string, unknown>)[key], prefix ? `${prefix}[${key}]` : key, pairs, arrayFormat)
    })
    return
  }

  // { search: "hello world" } -> "search=hello%20world"
  pairs.push(`${prefix}=${encodeURIComponent(String(value))}`)
}
