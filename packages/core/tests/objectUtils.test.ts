import { set } from 'es-toolkit/compat'
import { describe, expect, it } from 'vitest'
import { setPathPreservingIdentity, toStructuredCloneable } from '../src/objectUtils'

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

describe('toStructuredCloneable', () => {
  it('produces a value structuredClone accepts', () => {
    const props = { name: 'Joe', onClick: () => {}, nested: { fn() {}, keep: 1 } }

    expect(() => structuredClone(toStructuredCloneable(props))).not.toThrow()
  })

  it('drops function-valued keys and keeps the rest', () => {
    const props = { name: 'Joe', onClick: () => {}, nested: { fn() {}, keep: 1 } }

    expect(toStructuredCloneable(props)).toEqual({ name: 'Joe', nested: { keep: 1 } })
  })

  it('preserves array indices by nulling dropped entries', () => {
    expect(toStructuredCloneable({ items: [1, () => {}, 3] })).toEqual({ items: [1, null, 3] })
  })

  it('preserves length and indices for sparse arrays', () => {
    const result = toStructuredCloneable({ items: [1, , 3] }) as { items: unknown[] }

    expect(result.items).toHaveLength(3)
    expect(result.items[2]).toBe(3)
    expect(() => structuredClone(result)).not.toThrow()
  })

  it('does not mutate the input', () => {
    const fn = () => {}
    const props = { fn, keep: 1 }

    toStructuredCloneable(props)

    expect(props.fn).toBe(fn)
  })

  it('leaves an already-cloneable value structurally equal', () => {
    const props = { a: 1, b: [{ c: 'd' }], e: null }

    expect(toStructuredCloneable(props)).toEqual(props)
  })

  it('handles circular references', () => {
    const props: Record<string, unknown> = { a: 1 }
    props.self = props

    expect(() => structuredClone(toStructuredCloneable(props))).not.toThrow()
  })

  it('walks class instances rather than passing them through', () => {
    class Thing {
      name = 'Joe'
      onClick = () => {}
      greet() {}
    }

    const result = toStructuredCloneable({ thing: new Thing() })

    expect(() => structuredClone(result)).not.toThrow()
    expect(result).toEqual({ thing: { name: 'Joe' } })
  })

  it('preserves values structuredClone handles natively', () => {
    const props = { when: new Date(0), pattern: /x/g, seen: new Set([1]), by: new Map([['a', 1]]) }

    const result = toStructuredCloneable(props)

    expect(() => structuredClone(result)).not.toThrow()
    expect(result.when).toBeInstanceOf(Date)
    expect(result.pattern).toEqual(/x/g)
    expect(result.seen).toEqual(new Set([1]))
    expect(result.by).toEqual(new Map([['a', 1]]))
  })

  it('drops set entries that cannot be cloned', () => {
    const props = { seen: new Set([1, () => {}]) }

    const result = toStructuredCloneable(props)

    expect(() => structuredClone(result)).not.toThrow()
    expect(result.seen).toEqual(new Set([1]))
  })

  it('drops map entries whose key or value cannot be cloned', () => {
    const props = {
      by: new Map<unknown, unknown>([
        ['a', 1],
        ['b', () => {}],
        [() => {}, 2],
      ]),
    }

    const result = toStructuredCloneable(props)

    expect(() => structuredClone(result)).not.toThrow()
    expect(result.by).toEqual(new Map([['a', 1]]))
  })

  it('walks values nested inside sets and maps', () => {
    const props = {
      seen: new Set([{ fn: () => {}, keep: 1 }]),
      by: new Map([['a', { fn: () => {}, keep: 2 }]]),
    }

    const result = toStructuredCloneable(props)

    expect(() => structuredClone(result)).not.toThrow()
    expect(result.seen).toEqual(new Set([{ keep: 1 }]))
    expect(result.by).toEqual(new Map([['a', { keep: 2 }]]))
  })

  it('terminates on self-referencing Sets and Maps', () => {
    const set = new Set<unknown>()
    set.add(set)

    const map = new Map<unknown, unknown>()
    map.set('self', map)

    expect(() => structuredClone(toStructuredCloneable({ set, map }))).not.toThrow()
  })

  it('terminates on a cycle routed through a Map key', () => {
    const map = new Map<object, unknown>()
    const key: Record<string, unknown> = {}
    key.map = map
    map.set(key, 1)

    const result = toStructuredCloneable({ map })
    const [copiedKey] = [...result.map.keys()] as Record<string, unknown>[]

    expect(() => structuredClone(result)).not.toThrow()
    expect(copiedKey.map).toBe(result.map)
  })
})
