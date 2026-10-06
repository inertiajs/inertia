import { describe, expect, it } from 'vitest'
import { objectToFormData } from '../src/formData'

describe('objectToFormData', () => {
  it('appends big integers as their exact digits', () => {
    const form = objectToFormData({
      id: 900719925474099988n,
      negative: -900719925474099988n,
      nested: { ids: [1n, 2n] },
    })

    expect(form.get('id')).toBe('900719925474099988')
    expect(form.get('negative')).toBe('-900719925474099988')
    expect(form.getAll('nested[ids][]')).toEqual(['1', '2'])
  })
})
