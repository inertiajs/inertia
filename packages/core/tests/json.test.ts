import { describe, expect, it, vi } from 'vitest'
import { containsBigInt, parsePage, stringifyJson, stringifyPage } from '../src/json'

describe('parsePage', () => {
  it('revives markers when the page opted in', () => {
    const text = '{"props":{"id":{"$bigint":"900719925474099988"}},"preserveBigIntegers":true}'

    expect(parsePage(text).props.id).toBe(900719925474099988n)
  })

  it('leaves marker shaped props alone when the page did not opt in', () => {
    const text = '{"props":{"id":{"$bigint":"900719925474099988"}}}'

    expect(parsePage(text).props.id).toEqual({ $bigint: '900719925474099988' })
  })

  it('revives markers nested in arrays and objects', () => {
    const { props } = parsePage(
      '{"props":{"deep":[{"id":{"$bigint":"-1234567890123456789"}}]},"preserveBigIntegers":true}',
    )

    expect(props.deep[0].id).toBe(-1234567890123456789n)
  })

  it('parses a page exactly once, with or without markers', () => {
    const parse = vi.spyOn(JSON, 'parse')

    expect(parsePage('{"props":{"id":42},"preserveBigIntegers":true}').props.id).toBe(42)
    expect(parsePage('{"props":{"id":{"$bigint":"1"}},"preserveBigIntegers":true}').props.id).toBe(1n)
    expect(parse).toHaveBeenCalledTimes(2)

    parse.mockRestore()
  })

  it('returns payloads that are not pages as they are', () => {
    expect(parsePage('null')).toBeNull()
    expect(parsePage('"text"')).toBe('text')
    expect(parsePage('{"message":"Server Error"}')).toEqual({ message: 'Server Error' })
  })
})

describe('stringifyJson', () => {
  it('matches JSON.stringify for values without big integers', () => {
    const value = { a: 1, b: [true, null], c: new Date(0), d: undefined }

    expect(stringifyJson(value)).toBe(JSON.stringify(value))
  })

  it('sends big integers as their digits, since a plain stringify would throw', () => {
    expect(stringifyJson({ id: 900719925474099988n })).toBe('{"id":"900719925474099988"}')
    expect(stringifyJson({ deep: [1n, { nested: -2n }] })).toBe('{"deep":["1",{"nested":"-2"}]}')
  })

  it('still reports circular structures', () => {
    const cyclic: Record<string, unknown> = { a: 1 }
    cyclic.self = cyclic

    expect(() => stringifyJson(cyclic)).toThrow(/circular/i)
  })

  it('reports the original failure when the retry cannot help either', () => {
    const value = {
      id: 1n,
      get broken() {
        throw new Error('boom')
      },
    }

    // A plain stringify fails on the BigInt first, so its TypeError is what callers see.
    expect(() => stringifyJson(value)).toThrow(TypeError)
  })

  it('rethrows the original error when the value holds no big integers', () => {
    const value = {
      get broken() {
        throw new RangeError('cannot read this')
      },
    }

    expect(() => stringifyJson(value)).toThrow(RangeError)
    expect(() => stringifyJson(value)).toThrow('cannot read this')
  })
})

describe('stringifyPage', () => {
  it('leaves markers built by the app alone on pages without big integers', () => {
    const page = { component: 'Logs', props: { id: { $bigint: '900719925474099988' } } }

    expect(stringifyPage(page as any)).toBe(JSON.stringify(page))
  })

  it('flags a page holding big integers, so it parses back the way it went in', () => {
    const page = { component: 'Orders', props: { id: 900719925474099988n, list: [1n, 2n] } }

    expect(parsePage(stringifyPage(page as any))).toEqual({ ...page, preserveBigIntegers: true })
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
