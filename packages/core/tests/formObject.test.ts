import { describe, expect, it } from 'vitest'
import { formDataToObject } from './../'

function makeFormData(entries: [string, string | Blob][] = []): FormData {
  const formData = new FormData()
  for (const [key, value] of entries) {
    formData.append(key, value)
  }
  return formData
}

describe('formDataToObject', () => {
  it('returns an empty object when no fields are present', () => {
    const formData = new FormData()
    expect(formDataToObject(formData)).toEqual({})
  })

  it('converts flat key-value pairs into an object', () => {
    const formData = makeFormData([
      ['name', 'John'],
      ['email', 'john@example.com'],
    ])

    expect(formDataToObject(formData)).toEqual({
      name: 'John',
      email: 'john@example.com',
    })
  })

  it('creates nested objects using bracket notation', () => {
    const formData = makeFormData([
      ['user[name]', 'John'],
      ['user[email]', 'john@example.com'],
      ['user[address][city]', 'Paris'],
    ])

    expect(formDataToObject(formData)).toEqual({
      user: {
        name: 'John',
        email: 'john@example.com',
        address: { city: 'Paris' },
      },
    })
  })

  it('creates arrays from keys using empty bracket notation', () => {
    const formData = makeFormData([
      ['tags[]', 'one'],
      ['tags[]', 'two'],
      ['tags[]', 'three'],
    ])

    expect(formDataToObject(formData)).toEqual({
      tags: ['one', 'two', 'three'],
    })
  })

  it('overwrites earlier values when keys are repeated without brackets', () => {
    const formData = makeFormData([
      ['category', 'books'],
      ['category', 'movies'],
    ])

    expect(formDataToObject(formData)).toEqual({
      category: 'movies',
    })
  })

  it('builds indexed arrays of nested objects', () => {
    const formData = makeFormData([
      ['items[0][name]', 'A'],
      ['items[0][price]', '10'],
      ['items[1][name]', 'B'],
      ['items[1][price]', '20'],
    ])

    expect(formDataToObject(formData)).toEqual({
      items: [
        { name: 'A', price: '10' },
        { name: 'B', price: '20' },
      ],
    })
  })

  it('excludes empty files from the final result', () => {
    const emptyFile = new File([], '')
    const formData = makeFormData([['avatar', emptyFile]])

    expect(formDataToObject(formData)).toEqual({})
  })

  it('includes non-empty files as File instances', () => {
    const file = new File(['hello'], 'hello.txt', { type: 'text/plain' })
    const formData = makeFormData([['avatar', file]])

    const result = formDataToObject(formData)
    expect(result.avatar).toBeInstanceOf(File)
    expect(result.avatar.name).toBe('hello.txt')
  })

  it('collects multiple files from file[] input into an array', () => {
    const fileA = new File(['A'], 'a.txt')
    const fileB = new File(['B'], 'b.txt')
    const formData = makeFormData([
      ['documents[]', fileA],
      ['documents[]', fileB],
    ])

    const result = formDataToObject(formData)
    expect(result.documents).toHaveLength(2)
    expect(result.documents[0].name).toBe('a.txt')
    expect(result.documents[1].name).toBe('b.txt')
  })

  it('omits file[] keys if all files are empty', () => {
    const emptyA = new File([], '')
    const emptyB = new File([], '')
    const formData = makeFormData([
      ['documents[]', emptyA],
      ['documents[]', emptyB],
    ])

    expect(formDataToObject(formData)).toEqual({})
  })

  it('handles a combination of nested structures, arrays, and scalars', () => {
    const formData = makeFormData([
      ['user[name]', 'Jane'],
      ['user[roles][]', 'admin'],
      ['user[roles][]', 'editor'],
      ['settings[notifications][email]', '1'],
      ['settings[notifications][sms]', '0'],
      ['token', 'abc123'],
    ])

    expect(formDataToObject(formData)).toEqual({
      user: {
        name: 'Jane',
        roles: ['admin', 'editor'],
      },
      settings: {
        notifications: {
          email: '1',
          sms: '0',
        },
      },
      token: 'abc123',
    })
  })

  it('handles numeric string values correctly', () => {
    const formData = makeFormData([
      ['count', '0'],
      ['price', '123.45'],
    ])

    expect(formDataToObject(formData)).toEqual({
      count: '0',
      price: '123.45',
    })
  })

  it('supports mixed-type arrays: string and file', () => {
    const file = new File(['content'], 'file.txt')
    const formData = makeFormData([
      ['attachments[]', 'note'],
      ['attachments[]', file],
    ])

    const result = formDataToObject(formData)
    expect(Array.isArray(result.attachments)).toBe(true)
    expect(result.attachments[0]).toBe('note')
    expect(result.attachments[1]).toBeInstanceOf(File)
    expect(result.attachments[1].name).toBe('file.txt')
  })

  it('treats unbracketed nested keys as flat strings', () => {
    const formData = makeFormData([['user.address.city', 'Tokyo']])

    expect(formDataToObject(formData)).toEqual({
      'user.address.city': 'Tokyo',
    })
  })
})
