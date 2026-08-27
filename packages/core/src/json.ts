import { config } from './config'

/**
 * BigInt values cannot be represented in JSON, so integers outside the safe
 * range are transported as a `{ "$bigint": "<value>" }` marker and revived
 * with a custom reviver/replacer pair.
 *
 * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt#use_within_json
 */
const bigIntMarker = '$bigint'
const integerPattern = /^(0|-?[1-9]\d*)$/

const isEnabled = (): boolean => config.get('preserveBigIntegers')

const reviveBigInt = (_key: string, value: any): any => {
  if (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    typeof value[bigIntMarker] === 'string' &&
    Object.keys(value).length === 1 &&
    integerPattern.test(value[bigIntMarker])
  ) {
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
 * Scanning the raw text is roughly ten times cheaper than running the reviver,
 * so payloads without markers take the plain path. Payloads the server adapter
 * sent us are trusted, since the config is not known everywhere they arrive.
 */
export function parseJson(text: string, { trusted = false }: { trusted?: boolean } = {}): any {
  if ((trusted || isEnabled()) && text.includes(`"${bigIntMarker}"`)) {
    return JSON.parse(text, reviveBigInt)
  }

  return JSON.parse(text)
}

/**
 * Only a BigInt makes a plain stringify throw here, so the replacer is kept off
 * the common path. A circular structure throws again on the retry. Without the
 * feature a BigInt keeps throwing, so nothing silently changes shape.
 */
export function stringifyJson(value: any, { trusted = false }: { trusted?: boolean } = {}): string {
  if (!trusted && !isEnabled()) {
    return JSON.stringify(value)
  }

  try {
    return JSON.stringify(value)
  } catch {
    return JSON.stringify(value, replaceBigInt)
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
