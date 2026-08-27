import { afterEach, describe, expect, it } from 'vitest'
import { config } from '../src/config'
import { containsBigInt, parseJson, stringifyJson } from '../src/json'

const enable = () => config.set('preserveBigIntegers', true)

afterEach(() => {
  config.replace({})
})

describe('parseJson', () => {
  it('leaves markers alone until the feature is enabled', () => {
    const text = '{"props":{"id":{"$bigint":"900719925474099988"}}}'

    expect(parseJson(text).props.id).toEqual({ $bigint: '900719925474099988' })

    enable()

    expect(parseJson(text).props.id).toBe(900719925474099988n)
  })

  it('revives markers for a trusted payload without the feature enabled', () => {
    const text = '{"props":{"id":{"$bigint":"900719925474099988"}}}'

    expect(parseJson(text, { trusted: true }).props.id).toBe(900719925474099988n)
  })

  it('only revives canonical single-key integer markers', () => {
    enable()

    const { props } = parseJson(
      JSON.stringify({
        props: {
          negative: { $bigint: '-900719925474099988' },
          fraction: { $bigint: '12.5' },
          words: { $bigint: 'abc' },
          padded: { $bigint: '007' },
          negativeZero: { $bigint: '-0' },
          zero: { $bigint: '0' },
          extraKey: { $bigint: '1', other: 2 },
          numeric: { $bigint: 1 },
          note: 'the "$bigint" marker documented in a string',
        },
      }),
    )

    expect(props.negative).toBe(-900719925474099988n)
    expect(props.fraction).toEqual({ $bigint: '12.5' })
    expect(props.words).toEqual({ $bigint: 'abc' })
    expect(props.padded).toEqual({ $bigint: '007' })
    expect(props.negativeZero).toEqual({ $bigint: '-0' })
    expect(props.zero).toBe(0n)
    expect(props.extraKey).toEqual({ $bigint: '1', other: 2 })
    expect(props.numeric).toEqual({ $bigint: 1 })
    expect(props.note).toContain('$bigint')
  })

  it('revives markers nested in arrays and objects', () => {
    enable()

    const { props } = parseJson('{"props":{"deep":[{"id":{"$bigint":"-1234567890123456789"}}]}}')

    expect(props.deep[0].id).toBe(-1234567890123456789n)
  })
})

describe('stringifyJson', () => {
  it('matches JSON.stringify while the feature is disabled', () => {
    const value = { a: 1, b: [true, null], c: new Date(0), d: undefined }

    expect(stringifyJson(value)).toBe(JSON.stringify(value))
    expect(() => stringifyJson({ id: 1n })).toThrow(TypeError)
  })

  it('encodes big integers once enabled', () => {
    enable()

    expect(stringifyJson({ id: 900719925474099988n })).toBe('{"id":{"$bigint":"900719925474099988"}}')
    expect(stringifyJson({ deep: [1n, { nested: -2n }] })).toBe(
      '{"deep":[{"$bigint":"1"},{"nested":{"$bigint":"-2"}}]}',
    )
  })

  it('encodes big integers for a trusted value without the feature enabled', () => {
    expect(stringifyJson({ id: 1n }, { trusted: true })).toBe('{"id":{"$bigint":"1"}}')
  })

  it('still reports circular structures', () => {
    enable()

    const cyclic: Record<string, unknown> = { a: 1 }
    cyclic.self = cyclic

    expect(() => stringifyJson(cyclic)).toThrow(/circular/i)
  })

  it('round trips through parseJson', () => {
    enable()

    const value = { props: { id: 900719925474099988n, list: [1n, 2n] } }

    expect(parseJson(stringifyJson(value))).toEqual(value)
  })
})

describe('containsBigInt', () => {
  it('finds big integers at any depth', () => {
    expect(containsBigInt(1n)).toBe(true)
    expect(containsBigInt({ a: { b: [{ c: 1n }] } })).toBe(true)
    expect(containsBigInt({ a: 1, b: 'two', c: [null, new Date(0)] })).toBe(false)
  })

  it('does not recurse forever on circular structures', () => {
    const cyclic: Record<string, unknown> = { a: 1 }
    cyclic.self = cyclic

    expect(containsBigInt(cyclic)).toBe(false)

    cyclic.id = 1n

    expect(containsBigInt(cyclic)).toBe(true)
  })
})
