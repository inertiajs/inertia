import test, { expect } from '@playwright/test'
import { objectsAreEqual } from '../../packages/core/src/objectUtils'

test.describe('objectUtils.ts', () => {
  test.describe('objectsAreEqual', () => {
    test.describe('basic equality', () => {
      test('returns true for identical objects', () => {
        const obj1 = { a: 1, b: 2, c: 3 }
        const obj2 = { a: 1, b: 2, c: 3 }

        expect(objectsAreEqual(obj1, obj2, [])).toBe(true)
      })

      test('returns true for same reference', () => {
        const obj = { a: 1, b: 2 }

        expect(objectsAreEqual(obj, obj, [])).toBe(true)
      })

      test('returns true for empty objects', () => {
        expect(objectsAreEqual({}, {}, [])).toBe(true)
      })

      test('returns false for objects with different values', () => {
        const obj1 = { a: 1, b: 2 }
        const obj2 = { a: 1, b: 3 }

        expect(objectsAreEqual(obj1, obj2, [])).toBe(false)
      })
    })

    test.describe('asymmetric objects', () => {
      test('returns false when second object has additional keys', () => {
        const obj1 = { a: 1, b: 2 }
        const obj2 = { a: 1, b: 2, c: 3 }

        expect(objectsAreEqual(obj1, obj2, [])).toBe(false)
      })

      test('returns false when first object has additional keys', () => {
        const obj1 = { a: 1, b: 2, c: 3 }
        const obj2 = { a: 1, b: 2 }

        expect(objectsAreEqual(obj1, obj2, [])).toBe(false)
      })

      test('handles objects with overlapping and unique keys', () => {
        const obj1 = {
          name: 'test',
          type: 'example',
          config: { option: 'value' },
        }

        const obj2 = {
          name: 'test',
          type: 'example',
          config: { option: 'value' },
          extra: ['additional'],
        }

        expect(objectsAreEqual(obj1, obj2, [])).toBe(false)
      })
    })

    test.describe('key exclusion', () => {
      test('ignores excluded keys', () => {
        const obj1 = { a: 1, b: 2, ignore: 'foo' }
        const obj2 = { a: 1, b: 2, ignore: 'bar' }

        expect(objectsAreEqual(obj1, obj2, ['ignore'])).toBe(true)
      })

      test('does not ignore non-excluded keys', () => {
        const obj1 = { a: 1, b: 2, keep: 'foo' }
        const obj2 = { a: 1, b: 2, keep: 'bar' }

        // @ts-expect-error - Ignore key doesn't exist in obj1
        expect(objectsAreEqual(obj1, obj2, ['ignore'])).toBe(false)
      })

      test('handles asymmetric objects with excluded keys', () => {
        const obj1 = { a: 1, b: 2 }
        const obj2 = { a: 1, b: 2, ignore: 'value' }

        // Should be true because the extra key is excluded
        // @ts-expect-error - Ignore key doesn't exist in obj1
        expect(objectsAreEqual(obj1, obj2, ['ignore'])).toBe(true)
      })

      test('handles asymmetric objects with non-excluded keys', () => {
        const obj1 = { a: 1, b: 2 }
        const obj2 = { a: 1, b: 2, keep: 'value' }

        // Should be false because the extra key is not excluded
        // @ts-expect-error - Keep key doesn't exist in obj1
        expect(objectsAreEqual(obj1, obj2, ['ignore'])).toBe(false)
      })
    })

    test.describe('value types', () => {
      test('handles undefined values', () => {
        const obj1 = { a: 1, b: undefined }
        const obj2 = { a: 1, b: undefined }

        expect(objectsAreEqual(obj1, obj2, [])).toBe(true)
      })

      test('handles null values', () => {
        const obj1 = { a: 1, b: null }
        const obj2 = { a: 1, b: null }

        expect(objectsAreEqual(obj1, obj2, [])).toBe(true)
      })

      test('distinguishes between undefined and null', () => {
        const obj1 = { a: 1, b: undefined }
        const obj2 = { a: 1, b: null }

        // @ts-expect-error - Different types for key 'b'
        expect(objectsAreEqual(obj1, obj2, [])).toBe(false)
      })

      test('handles boolean values', () => {
        const obj1 = { a: true, b: false }
        const obj2 = { a: true, b: false }

        expect(objectsAreEqual(obj1, obj2, [])).toBe(true)
      })

      test('handles string values', () => {
        const obj1 = { a: 'hello', b: 'world' }
        const obj2 = { a: 'hello', b: 'world' }

        expect(objectsAreEqual(obj1, obj2, [])).toBe(true)
      })

      test('handles array values', () => {
        const obj1 = { a: [1, 2, 3], b: ['x', 'y'] }
        const obj2 = { a: [1, 2, 3], b: ['x', 'y'] }

        expect(objectsAreEqual(obj1, obj2, [])).toBe(true)
      })

      test('detects different array values', () => {
        const obj1 = { a: [1, 2, 3] }
        const obj2 = { a: [1, 2, 4] }

        expect(objectsAreEqual(obj1, obj2, [])).toBe(false)
      })

      test('handles nested objects', () => {
        const obj1 = { a: 1, nested: { x: 1, y: 2 } }
        const obj2 = { a: 1, nested: { x: 1, y: 2 } }

        expect(objectsAreEqual(obj1, obj2, [])).toBe(true)
      })

      test('detects different nested objects', () => {
        const obj1 = { a: 1, nested: { x: 1, y: 2 } }
        const obj2 = { a: 1, nested: { x: 1, y: 3 } }

        expect(objectsAreEqual(obj1, obj2, [])).toBe(false)
      })

      test('handles functions', () => {
        const fn = () => 'test'
        const obj1 = { a: 1, fn }
        const obj2 = { a: 1, fn }

        expect(objectsAreEqual(obj1, obj2, [])).toBe(true)
      })

      test('detects different functions', () => {
        const obj1 = { a: 1, fn: () => 'test1' }
        const obj2 = { a: 1, fn: () => 'test2' }

        expect(objectsAreEqual(obj1, obj2, [])).toBe(false)
      })
    })
  })
})
