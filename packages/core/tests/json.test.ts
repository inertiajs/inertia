import { describe, expect, it, vi } from 'vitest'
import { containsBigInt, encodesBigIntegers, parseInitialPage, parseJson, stringifyJson } from '../src/json'

describe('parseJson', () => {
  it('leaves markers alone until the payload is trusted', () => {
    const text = '{"props":{"id":{"$bigint":"900719925474099988"}}}'

    expect(parseJson(text).props.id).toEqual({ $bigint: '900719925474099988' })
    expect(parseJson(text, { trusted: true }).props.id).toBe(900719925474099988n)
  })

  it('only revives canonical single-key integer markers', () => {
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
      { trusted: true },
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
    const { props } = parseJson('{"props":{"deep":[{"id":{"$bigint":"-1234567890123456789"}}]}}', { trusted: true })

    expect(props.deep[0].id).toBe(-1234567890123456789n)
  })
})

describe('stringifyJson', () => {
  it('matches JSON.stringify for values without big integers', () => {
    const value = { a: 1, b: [true, null], c: new Date(0), d: undefined }

    expect(stringifyJson(value)).toBe(JSON.stringify(value))
  })

  it('always encodes big integers, since a plain stringify would throw', () => {
    expect(stringifyJson({ id: 900719925474099988n })).toBe('{"id":{"$bigint":"900719925474099988"}}')
    expect(stringifyJson({ deep: [1n, { nested: -2n }] })).toBe(
      '{"deep":[{"$bigint":"1"},{"nested":{"$bigint":"-2"}}]}',
    )
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

    // The BigInt is hit first, so a TypeError is the real failure. Walking the
    // value again to check for a BigInt would surface 'boom' instead.
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

  it('round trips through parseJson', () => {
    const value = { props: { id: 900719925474099988n, list: [1n, 2n] } }

    expect(parseJson(stringifyJson(value), { trusted: true })).toEqual(value)
  })
})

describe('parseInitialPage', () => {
  // No response header is readable for the initial page, and the root view may
  // be a cached compile, so the page itself has to say whether it opted in.
  it('revives markers when the page opted in', () => {
    const text = '{"props":{"id":{"$bigint":"900719925474099988"}},"preserveBigIntegers":true}'

    expect(parseInitialPage(text).props.id).toBe(900719925474099988n)
  })

  it('leaves marker shaped props alone when the page did not opt in', () => {
    const text = '{"props":{"id":{"$bigint":"900719925474099988"}}}'

    expect(parseInitialPage(text).props.id).toEqual({ $bigint: '900719925474099988' })
  })

  it('parses a page without markers exactly once', () => {
    const parse = vi.spyOn(JSON, 'parse')
    const text = '{"props":{"id":42},"preserveBigIntegers":true}'

    expect(parseInitialPage(text).props.id).toBe(42)
    expect(parse).toHaveBeenCalledTimes(1)

    parse.mockRestore()
  })
})

describe('warns about rounded integers', () => {
  // The warning fires once per page load, so each case needs a fresh module.
  const freshParseJson = async () => {
    vi.resetModules()

    // The warning is deliberately browser only, so vitest needs to look like one.
    vi.stubGlobal('window', {})

    return (await import('../src/json')).parseJson
  }

  it('reports an integer the parse is about to round, once', async () => {
    const parse = await freshParseJson()

    const error = vi.spyOn(console, 'error').mockImplementation(() => {})

    parse('{"context":{"number":900719925474099988}}')

    expect(error).toHaveBeenCalledTimes(1)
    expect(error.mock.calls[0][0]).toContain('900719925474099988')
    expect(error.mock.calls[0][0]).toContain('900719925474100000')

    parse('{"other":[900719925474099989]}')

    expect(error).toHaveBeenCalledTimes(1)

    error.mockRestore()
  })

  it('finds integers inside arrays, not only object values', async () => {
    const parse = await freshParseJson()

    const error = vi.spyOn(console, 'error').mockImplementation(() => {})

    parse('{"context":{"nested":{"deeper":[900719925474099988]}}}')

    expect(error).toHaveBeenCalledTimes(1)

    error.mockRestore()
  })

  it('stays quiet for safe integers, digits in strings, and floats', async () => {
    const parse = await freshParseJson()

    const error = vi.spyOn(console, 'error').mockImplementation(() => {})

    parse('{"n":9007199254740991,"m":-9007199254740991}')
    parse('{"note":"900719925474099988"}')
    parse('{"n":9.007199254741e+15}')

    // Delimiters inside a string value must not look like structure.
    parse('{"log":"order ids: 1,900719925474099988,done"}')
    parse('{"payload":"{\\"id\\":900719925474099988}"}')
    parse('{"note":"ids [900719925474099988]"}')

    expect(error).not.toHaveBeenCalled()

    error.mockRestore()
  })
})

describe('encodesBigIntegers', () => {
  // useHttp and precognition hand over an already-serialized body, so the
  // announcement cannot depend on seeing a live BigInt.
  it('recognises markers in a serialized body', () => {
    expect(encodesBigIntegers('{"id":{"$bigint":"900719925474099988"}}')).toBe(true)
    expect(encodesBigIntegers('{"id":42}')).toBe(false)
  })

  it('recognises a live BigInt in an object body', () => {
    expect(encodesBigIntegers({ id: 900719925474099988n })).toBe(true)
    expect(encodesBigIntegers({ id: 42 })).toBe(false)
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
