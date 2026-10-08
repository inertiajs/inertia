import type { Page } from './types'

/**
 * BigInt values cannot be represented in JSON, so integers outside the safe
 * range are transported as a `{ "$bigint": "<value>" }` marker, written by a
 * custom replacer and revived after parsing.
 *
 * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt#use_within_json
 */
const bigIntMarker = '$bigint'

const replaceBigInt = (_key: string, value: any): any => {
  if (typeof value === 'bigint') {
    return { [bigIntMarker]: value.toString() }
  }

  return value
}

const replaceBigIntWithDigits = (_key: string, value: any): any => {
  if (typeof value === 'bigint') {
    return value.toString()
  }

  return value
}

/**
 * Markers are only revived on pages that opted in, so an application sending
 * its own `$bigint` objects receives them untouched.
 */
export function parsePage(text: string): any {
  const page = JSON.parse(text)

  if (page?.preserveBigIntegers === true && text.includes(`"${bigIntMarker}"`)) {
    reviveBigIntegers(page)
  }

  return page
}

/**
 * Walking the freshly parsed page is several times faster than a JSON.parse
 * reviver, which calls back for every value. Arrays are walked by index, since
 * key lists over large arrays of numbers are slow in some engines.
 */
function reviveBigIntegers(value: any): void {
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index++) {
      value[index] = reviveBigInteger(value[index])
    }

    return
  }

  for (const key of Object.keys(value)) {
    value[key] = reviveBigInteger(value[key])
  }
}

function reviveBigInteger(value: any): any {
  if (value === null || typeof value !== 'object') {
    return value
  }

  if (typeof value[bigIntMarker] === 'string') {
    return BigInt(value[bigIntMarker])
  }

  reviveBigIntegers(value)

  return value
}

/**
 * A page holding BigInt values is flagged as it is serialized, so a page built
 * on the client (or with remembered state) parses back the way it went in.
 */
export function stringifyPage(page: Page): string {
  return stringify(page, () => ({ ...page, preserveBigIntegers: true }), replaceBigInt)
}

/**
 * Request bodies send a BigInt as its digits, the same way form data and query
 * strings do, so the server receives it like any other numeric input.
 */
export function stringifyJson(value: any): string {
  return stringify(value, () => value, replaceBigIntWithDigits)
}

/**
 * The replacer is kept off the common path, so a plain stringify runs first and
 * the replacer only runs after it fails. When the retry fails too, the original
 * error is rethrown, so a circular structure still reports its own error.
 */
function stringify(value: any, retryValue: () => any, replacer: (key: string, value: any) => any): string {
  try {
    return JSON.stringify(value)
  } catch (error) {
    try {
      return JSON.stringify(retryValue(), replacer)
    } catch {
      throw error
    }
  }
}

export function containsBigInt(value: any, seen: WeakSet<object> = new WeakSet()): boolean {
  if (typeof value === 'bigint') {
    return true
  }

  if (value === null || typeof value !== 'object') {
    return false
  }

  if (seen.has(value)) {
    return false
  }

  seen.add(value)

  const values = Array.isArray(value) ? value : Object.values(value)

  return values.some((nested) => containsBigInt(nested, seen))
}
