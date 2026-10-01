import type { Page } from './types'

/**
 * BigInt values cannot be represented in JSON, so integers outside the safe
 * range are transported as a `{ "$bigint": "<value>" }` marker and revived
 * with a custom reviver/replacer pair.
 *
 * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt#use_within_json
 */
export const bigIntMarker = '$bigint'
export const preserveBigIntegersHeader = 'x-inertia-preserve-big-integers'

const reviveBigInt = (_key: string, value: any): any => {
  if (value !== null && typeof value === 'object' && typeof value[bigIntMarker] === 'string') {
    return BigInt(value[bigIntMarker])
  }

  return value
}

const replaceBigInt = (_key: string, value: any): any => {
  if (typeof value === 'bigint') {
    return { [bigIntMarker]: value.toString() }
  }

  return value
}

/**
 * Markers are only revived on pages that opted in, so an application sending
 * its own `$bigint` objects receives them untouched. The second parse only
 * happens on a page that actually opted in.
 */
export function parsePage(text: string): any {
  const page = JSON.parse(text)

  if (page?.preserveBigIntegers === true && text.includes(`"${bigIntMarker}"`)) {
    return JSON.parse(text, reviveBigInt)
  }

  return page
}

/**
 * A page holding BigInt values is flagged as it is serialized, so a page built
 * on the client (or with remembered state) parses back the way it went in.
 */
export function stringifyPage(page: Page): string {
  return stringify(page, () => ({ ...page, preserveBigIntegers: true }))
}

export function stringifyJson(value: any): string {
  return stringify(value, () => value)
}

/**
 * The replacer is kept off the common path, so a plain stringify runs first and
 * only a BigInt earns the retry. Any other failure is rethrown untouched, so a
 * circular structure or a throwing getter still reports its original error.
 */
function stringify(value: any, valueWithBigInts: () => any): string {
  try {
    return JSON.stringify(value)
  } catch (error) {
    try {
      return JSON.stringify(valueWithBigInts(), replaceBigInt)
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
