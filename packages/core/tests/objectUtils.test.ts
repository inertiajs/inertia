import { set } from 'es-toolkit/compat'
import { describe, expect, it } from 'vitest'
import { objectsAreEqual, setPathPreservingIdentity } from '../src/objectUtils'

describe('setPathPreservingIdentity', () => {
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
      expect(setPathPreservingIdentity(structuredClone(target), path, value)).toEqual(
        set(structuredClone(target), path, value),
      )
    }
  })

  it('does not mutate the input', () => {
    const target = { user: { name: 'Joe' }, other: { keep: true } }
    const snapshot = structuredClone(target)

    setPathPreservingIdentity(target, 'user.name', 'Jane')

    expect(target).toEqual(snapshot)
  })

  it('preserves the identity of untouched values (the reason it exists)', () => {
    const other = { keep: true }
    const sibling = { id: 1 }
    const target = { user: { name: 'Joe', sibling }, other }

    const result = setPathPreservingIdentity(target, 'user.name', 'Jane')

    expect(result.user.name).toBe('Jane')
    expect(result.other).toBe(other) // untouched top-level prop: same object
    expect(result.user.sibling).toBe(sibling) // untouched sibling on the path: same object
    expect(result).not.toBe(target)
    expect(result.user).not.toBe(target.user) // containers on the path are copies
  })

  it('preserves the identity of untouched siblings on a deeper path', () => {
    const untouched = { deep: true }
    const target = { group: { a: { keep: 1 }, b: 2, untouched } }

    const result = setPathPreservingIdentity(target, 'group.b', 3)

    expect(result.group.b).toBe(3)
    expect(result.group.untouched).toBe(untouched)
    expect(result.group.a).toBe(target.group.a) // sibling object under the touched container keeps identity
    expect(result.group).not.toBe(target.group)
  })

  it('preserves identity of untouched array elements', () => {
    const first = { id: 1 }
    const target = { items: [first, { id: 2 }] }

    const result = setPathPreservingIdentity(target, 'items[1].id', 99)

    expect(result.items[0]).toBe(first)
    expect(result.items[1]).toEqual({ id: 99 })
  })
})

describe('objectsAreEqual', () => {
  const formData = (entries: Record<string, string>) => {
    const form = new FormData()

    Object.entries(entries).forEach(([key, value]) => form.append(key, value))

    return form
  }

  it('compares form data by its entries', () => {
    expect(objectsAreEqual({ data: formData({ term: 'apple' }) }, { data: formData({ term: 'apple' }) }, [])).toBe(true)
    expect(objectsAreEqual({ data: formData({ term: 'apple' }) }, { data: formData({ term: 'banana' }) }, [])).toBe(
      false,
    )
    expect(objectsAreEqual({ data: formData({ term: 'apple' }) }, { data: formData({}) }, [])).toBe(false)
    expect(objectsAreEqual({ data: formData({ term: 'apple' }) }, { data: { term: 'apple' } }, [])).toBe(false)
  })

  it('does not consider null, objects and arrays equal', () => {
    expect(objectsAreEqual({ filter: null }, { filter: {} }, [])).toBe(false)
    expect(objectsAreEqual({ filter: {} }, { filter: null }, [])).toBe(false)
    expect(objectsAreEqual({ filter: [] }, { filter: {} }, [])).toBe(false)
    expect(objectsAreEqual({ filter: null }, { filter: null }, [])).toBe(true)
  })

  it('compares dates by their time', () => {
    expect(objectsAreEqual({ date: new Date(1000) }, { date: new Date(1000) }, [])).toBe(true)
    expect(objectsAreEqual({ date: new Date(1000) }, { date: new Date(2000) }, [])).toBe(false)
  })
})
