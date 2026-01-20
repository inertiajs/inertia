import test, { expect } from '@playwright/test'
import { formDataToObject } from '../../packages/core/src/formObject'

function makeFormData(entries: [string, string | Blob][] = []): FormData {
  const formData = new FormData()
  for (const [key, value] of entries) {
    formData.append(key, value)
  }
  return formData
}

test.describe('formObject.ts', () => {
  test.describe('formDataToObject', () => {
    test('returns an empty object when no fields are present', () => {
      const formData = new FormData()
      expect(formDataToObject(formData)).toEqual({})
    })

    test('converts flat key-value pairs into an object', () => {
      const formData = makeFormData([
        ['name', 'John'],
        ['email', 'john@example.com'],
      ])

      expect(formDataToObject(formData)).toEqual({
        name: 'John',
        email: 'john@example.com',
      })
    })

    test('creates nested objects using bracket notation', () => {
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

    test('creates arrays from keys using empty bracket notation', () => {
      const formData = makeFormData([
        ['tags[]', 'one'],
        ['tags[]', 'two'],
        ['tags[]', 'three'],
      ])

      expect(formDataToObject(formData)).toEqual({
        tags: ['one', 'two', 'three'],
      })
    })

    test('overwrites earlier values when keys are repeated without brackets', () => {
      const formData = makeFormData([
        ['category', 'books'],
        ['category', 'movies'],
      ])

      expect(formDataToObject(formData)).toEqual({
        category: 'movies',
      })
    })

    test('builds indexed arrays of nested objects', () => {
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

    test('excludes empty files from the final result', () => {
      const emptyFile = new File([], '')
      const formData = makeFormData([['avatar', emptyFile]])

      expect(formDataToObject(formData)).toEqual({})
    })

    test('includes non-empty files as File instances', () => {
      const file = new File(['hello'], 'hello.txt', { type: 'text/plain' })
      const formData = makeFormData([['avatar', file]])

      const result = formDataToObject(formData)
      expect(result.avatar).toBeInstanceOf(File)
      expect(result.avatar.name).toBe('hello.txt')
    })

    test('collects multiple files from file[] input into an array', () => {
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

    test('omits file[] keys if all files are empty', () => {
      const emptyA = new File([], '')
      const emptyB = new File([], '')
      const formData = makeFormData([
        ['documents[]', emptyA],
        ['documents[]', emptyB],
      ])

      expect(formDataToObject(formData)).toEqual({})
    })

    test('handles a combination of nested structures, arrays, and scalars', () => {
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

    test('handles numeric string values correctly', () => {
      const formData = makeFormData([
        ['count', '0'],
        ['price', '123.45'],
      ])

      expect(formDataToObject(formData)).toEqual({
        count: '0',
        price: '123.45',
      })
    })

    test('supports mixed-type arrays: string and file', () => {
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

    test('converts dotted keys into nested objects', () => {
      const formData = makeFormData([
        ['user.name', 'John'],
        ['user.email', 'john@example.com'],
        ['user.address.city', 'Paris'],
        ['user.address.country', 'France'],
      ])

      expect(formDataToObject(formData)).toEqual({
        user: {
          name: 'John',
          email: 'john@example.com',
          address: {
            city: 'Paris',
            country: 'France',
          },
        },
      })
    })

    test('handles escaped dots as literal characters in keys', () => {
      const formData = makeFormData([
        ['user\\.name', 'Literal key'],
        ['config.app\\.version', '1.0.0'],
        ['deeply\\.nested\\.key\\.with\\.escapes', 'value'],
      ])

      expect(formDataToObject(formData)).toEqual({
        'user.name': 'Literal key',
        config: {
          'app.version': '1.0.0',
        },
        'deeply.nested.key.with.escapes': 'value',
      })
    })

    test('handles complex mixed dotted and bracket notation', () => {
      const formData = makeFormData([
        ['users.company[address].street', '123 Main St'],
        ['users.company[address].number', '42'],
        ['users.profile.settings[theme].mode', 'dark'],
        ['data.items[0].tags[]', 'urgent'],
        ['data.items[0].tags[]', 'important'],
        ['data.items[1].name', 'Second Item'],
      ])

      expect(formDataToObject(formData)).toEqual({
        users: {
          company: {
            address: {
              street: '123 Main St',
              number: '42',
            },
          },
          profile: {
            settings: {
              theme: {
                mode: 'dark',
              },
            },
          },
        },
        data: {
          items: [
            {
              tags: ['urgent', 'important'],
            },
            {
              name: 'Second Item',
            },
          ],
        },
      })
    })

    test('handles mixed numeric and string keys as objects', () => {
      const formData = makeFormData([
        ['fields[entries][100][name]', 'John Doe'],
        ['fields[entries][100][email]', 'john@example.com'],
        ['fields[entries][new:1][name]', 'Jane Smith'],
        ['fields[entries][new:1][email]', 'jane@example.com'],
      ])

      const result = formDataToObject(formData)

      expect(Array.isArray(result.fields.entries)).toBe(false)
      expect(typeof result.fields.entries).toBe('object')

      expect(Object.keys(result.fields.entries)).toHaveLength(2)

      expect(result.fields.entries['100']).toEqual({
        name: 'John Doe',
        email: 'john@example.com',
      })

      expect(result.fields.entries['new:1']).toEqual({
        name: 'Jane Smith',
        email: 'jane@example.com',
      })
    })

    test('still creates arrays for sequential numeric indices', () => {
      const formData = makeFormData([
        ['items[0][name]', 'First'],
        ['items[1][name]', 'Second'],
        ['items[2][name]', 'Third'],
      ])

      const result = formDataToObject(formData)

      // Should create an array for sequential indices
      expect(Array.isArray(result.items)).toBe(true)
      expect(result.items).toEqual([{ name: 'First' }, { name: 'Second' }, { name: 'Third' }])
    })

    test('creates objects for non-sequential numeric keys', () => {
      const formData = makeFormData([
        ['items[0][name]', 'First'],
        ['items[5][name]', 'Sixth'],
        ['items[10][name]', 'Eleventh'],
      ])

      const result = formDataToObject(formData)

      expect(Array.isArray(result.items)).toBe(false)
      expect(typeof result.items).toBe('object')
      expect(Object.keys(result.items)).toHaveLength(3)
      expect(result.items['0']).toEqual({ name: 'First' })
      expect(result.items['5']).toEqual({ name: 'Sixth' })
      expect(result.items['10']).toEqual({ name: 'Eleventh' })
    })

    test('creates objects when mixing numeric and string keys', () => {
      const formData = makeFormData([
        ['users[123][name]', 'User 123'],
        ['users[admin][name]', 'Admin User'],
        ['users[0][name]', 'User 0'],
      ])

      const result = formDataToObject(formData)

      expect(Array.isArray(result.users)).toBe(false)
      expect(typeof result.users).toBe('object')
      expect(Object.keys(result.users)).toHaveLength(3)
      expect(result.users['123']).toEqual({ name: 'User 123' })
      expect(result.users['admin']).toEqual({ name: 'Admin User' })
      expect(result.users['0']).toEqual({ name: 'User 0' })
    })

    test('handles explicit indexed arrays correctly', () => {
      const formData = makeFormData([
        ['emails[1]', 'second@example.com'],
        ['emails[0]', 'first@example.com'],
        ['emails[2]', 'third@example.com'],
      ])

      const result = formDataToObject(formData)

      expect(Array.isArray(result.emails)).toBe(true)
      expect(result.emails).toEqual(['first@example.com', 'second@example.com', 'third@example.com'])
    })

    test('handles mixed empty bracket and explicit index notation - empty brackets first', () => {
      const formData = makeFormData([
        ['tags[]', 'tag1'],
        ['tags[]', 'tag2'],
        ['tags[2]', 'tag3'],
        ['tags[3]', 'tag4'],
      ])

      const result = formDataToObject(formData)

      expect(Array.isArray(result.tags)).toBe(true)
      expect(result.tags).toEqual(['tag1', 'tag2', 'tag3', 'tag4'])
    })

    test('handles mixed empty bracket and explicit index notation - explicit indices first', () => {
      const formData = makeFormData([
        ['tags[2]', 'tag1'],
        ['tags[3]', 'tag2'],
        ['tags[]', 'tag3'],
        ['tags[]', 'tag4'],
      ])

      const result = formDataToObject(formData)

      expect(Array.isArray(result.tags)).toBe(true)
      expect(result.tags).toEqual(['tag1', 'tag2', 'tag3', 'tag4'])
    })

    test('handles mixed empty bracket and explicit index notation - mixed', () => {
      const formData = makeFormData([
        ['tags[2]', 'tag1'],
        ['tags[3]', 'tag2'],
        ['tags[]', 'tag3'],
        ['tags[]', 'tag4'],
        ['tags[4]', 'tag5'],
        ['tags[5]', 'tag6'],
      ])

      const result = formDataToObject(formData)

      expect(Array.isArray(result.tags)).toBe(true)
      expect(result.tags).toEqual(['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6'])
    })
  })
})
