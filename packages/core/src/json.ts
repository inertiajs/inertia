/**
 * BigInt values cannot be represented in JSON, so integers outside the safe
 * range are transported as a `{ "$bigint": "<value>" }` marker and revived
 * with a custom reviver/replacer pair.
 *
 * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt#use_within_json
 */
export const bigIntMarker = '$bigint'
export const preserveBigIntegersHeader = 'x-inertia-preserve-big-integers'
const integerPattern = /^(0|-?[1-9]\d*)$/

// Anchored on the characters that can precede a JSON number, so values inside
// arrays are caught too and digits inside strings are not.
const unsafeIntegerPattern = /[:,[]\s*(-?\d{16,})(?=[,}\]\s])/g
const maxSafeInteger = BigInt(Number.MAX_SAFE_INTEGER)

let warnedAboutUnsafeIntegers = false

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
 * Only payloads the server told us to expect markers in are revived, so a prop
 * that merely looks like a marker is left alone. Scanning the raw text first is
 * roughly ten times cheaper than running the reviver over a payload without one.
 */
export function parseJson(text: string, { trusted = false }: { trusted?: boolean } = {}): any {
  if (trusted && text.includes(`"${bigIntMarker}"`)) {
    return JSON.parse(text, reviveBigInt)
  }

  warnAboutUnsafeIntegers(text)

  return JSON.parse(text)
}

/**
 * Point out integers the parse below is about to round, which is the one moment
 * the exact value is still available. Reported once per page load, and only in
 * the browser, since the server renders for everyone rather than one developer.
 */
function warnAboutUnsafeIntegers(text: string): void {
  if (warnedAboutUnsafeIntegers || typeof window === 'undefined') {
    return
  }

  for (const match of text.matchAll(unsafeIntegerPattern)) {
    const digits = match[1]
    const value = BigInt(digits)

    if (value <= maxSafeInteger && value >= -maxSafeInteger) {
      continue
    }

    // Digits inside a string value are not numbers and are not rounded, so the
    // cheap scan above has to be confirmed before anything is reported.
    if (isInsideString(text, match.index)) {
      continue
    }

    warnedAboutUnsafeIntegers = true

    console.error(
      `[Inertia] This response contains the integer ${digits}, which is beyond JavaScript's safe range and has been rounded to ${Number(digits)}. ` +
        `Enable big integer preservation on your server adapter to receive it as a BigInt instead.`,
    )

    return
  }
}

/**
 * Determine whether the given offset falls inside a JSON string literal.
 */
function isInsideString(text: string, offset: number): boolean {
  let inString = false

  for (let index = 0; index < offset; index++) {
    if (text[index] === '\\') {
      index++

      continue
    }

    if (text[index] === '"') {
      inString = !inString
    }
  }

  return inString
}

/**
 * The initial page has no response header to read, and the server template that
 * renders it may be a cached compile, so the signal rides inside the page. The
 * second parse only happens on a page that actually opted in.
 */
export function parseInitialPage(text: string): any {
  if (!text.includes(`"${bigIntMarker}"`)) {
    return parseJson(text)
  }

  const page = JSON.parse(text)

  return page?.preserveBigIntegers === true ? JSON.parse(text, reviveBigInt) : page
}

/**
 * The replacer is kept off the common path, so a plain stringify runs first and
 * only a BigInt earns the retry. Any other failure is rethrown untouched, so a
 * circular structure or a throwing getter still reports its original error.
 */
export function stringifyJson(value: any): string {
  try {
    return JSON.stringify(value)
  } catch (error) {
    // Only a BigInt is recoverable here. Letting the retry decide avoids
    // walking the value a second time, which could trip whatever threw.
    try {
      return JSON.stringify(value, replaceBigInt)
    } catch {
      throw error
    }
  }
}

/**
 * Determine whether a request body carries big integer markers. Callers may
 * hand over a value or an already-serialized body, so both shapes are checked.
 */
export function encodesBigIntegers(body: unknown): boolean {
  return typeof body === 'string' ? body.includes(`"${bigIntMarker}"`) : containsBigInt(body)
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
