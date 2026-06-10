import { describe, expect, it } from 'vitest'
import { history } from '../src/history'

describe('history.ts', () => {
  describe('isValidState', () => {
    it('returns false for null state', () => {
      expect(history.isValidState(null)).toBe(false)
    })

    it('returns false for undefined state', () => {
      expect(history.isValidState(undefined)).toBe(false)
    })

    it('returns false for primitive states', () => {
      expect(history.isValidState('some-string')).toBe(false)
      expect(history.isValidState(123)).toBe(false)
      expect(history.isValidState(true)).toBe(false)
      expect(history.isValidState(false)).toBe(false)
    })

    it('returns false for object without page property', () => {
      expect(history.isValidState({})).toBe(false)
      expect(history.isValidState({ other: 'value' })).toBe(false)
    })

    it('returns true for object with page property', () => {
      expect(history.isValidState({ page: {} })).toBe(true)
      expect(history.isValidState({ page: 'component-name' })).toBe(true)
    })
  })
})
