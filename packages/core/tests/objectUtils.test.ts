import { set } from 'es-toolkit/compat'
import { describe, expect, it } from 'vitest'
import { setImmutable } from '../src/objectUtils'

describe('setImmutable', () => {
  it('matches es-toolkit set() semantics for values', () => {
    const cases: Array<[Record<string, unknown>, string, unknown]> = [
      [{ a: 1 }, 'a', 2],
      [{ a: 1 }, 'b', 2],
      [{ user: { name: 'Joe', age: 3 } }, 'user.name', 'Jane'],
      [{ items: [{ id: 1 }, { id: 2 }] }, 'items[1].id', 99],
      [{ items: [1, 2, 3] }, 'items.1', 9],
      [{}, 'a.b.c', 'deep'],
      [{}, 'list[0]', 'first'],
      [{ a: null }, 'a.b', 1],
    ]

    for (const [target, path, value] of cases) {
      expect(setImmutable(structuredClone(target), path, value)).toEqual(
        set(structuredClone(target), path, value),
      )
    }
  })

  it('does not mutate the input', () => {
    const target = { user: { name: 'Joe' }, other: { keep: true } }
    const snapshot = structuredClone(target)

    setImmutable(target, 'user.name', 'Jane')

    expect(target).toEqual(snapshot)
  })

  it('preserves the identity of untouched values (the reason it exists)', () => {
    const other = { keep: true }
    const sibling = { id: 1 }
    const target = { user: { name: 'Joe', sibling }, other }

    const result = setImmutable(target, 'user.name', 'Jane')

    expect(result.user.name).toBe('Jane')
    expect(result.other).toBe(other) // untouched top-level prop: same object
    expect(result.user.sibling).toBe(sibling) // untouched sibling on the path: same object
    expect(result).not.toBe(target)
    expect(result.user).not.toBe(target.user) // containers on the path are copies
  })

  it('preserves identity of untouched array elements', () => {
    const first = { id: 1 }
    const target = { items: [first, { id: 2 }] }

    const result = setImmutable(target, 'items[1].id', 99)

    expect(result.items[0]).toBe(first)
    expect(result.items[1]).toEqual({ id: 99 })
  })
})
