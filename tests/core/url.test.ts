import test, { expect } from '@playwright/test'
import { mergeDataIntoQueryString } from '../../packages/core'

test.describe('url.ts', () => {
  test.describe('mergeDataIntoQueryString', () => {
    test.describe('GET request', () => {
      test('appends data to a URL without an existing query string', () => {
        const [href, data] = mergeDataIntoQueryString('get', '/search', { q: 'foo' })

        expect(href).toBe('/search?q=foo')
        expect(data).toEqual({})
      })

      test('merges new data into an existing query string', () => {
        const [href, data] = mergeDataIntoQueryString('get', '/search?lang=en', { q: 'bar' })

        expect(href).toBe('/search?lang=en&q=bar')
        expect(data).toEqual({})
      })

      test('overwrites existing keys in the query string when they also exist in the data', () => {
        const [href, data] = mergeDataIntoQueryString('get', '/search?q=old', { q: 'new' })

        expect(href).toBe('/search?q=new')
        expect(data).toEqual({})
      })

      test('keeps key when new value is null', () => {
        const [href, data] = mergeDataIntoQueryString('get', '/page?foo=bar&keep=yes', { foo: null })

        expect(href).toBe('/page?foo=&keep=yes')
        expect(data).toEqual({})
      })

      test('removes query string keys when their corresponding data value is undefined', () => {
        const [href, data] = mergeDataIntoQueryString('get', '/search?q=keep&remove=me', { remove: undefined })

        expect(href).toBe('/search?q=keep')
        expect(data).toEqual({})
      })

      test('serializes arrays using bracket notation by default', () => {
        const [href, data] = mergeDataIntoQueryString('get', '/filter', { tag: ['foo', 'bar'] })

        expect(href).toBe('/filter?tag[]=foo&tag[]=bar')
        expect(data).toEqual({})
      })

      test('serializes arrays using index notation when specified', () => {
        const [href, data] = mergeDataIntoQueryString('get', '/filter', { tag: ['foo', 'bar'] }, 'indices')

        expect(href).toBe('/filter?tag[0]=foo&tag[1]=bar')
        expect(data).toEqual({})
      })

      test('preserves the full origin when the URL is absolute', () => {
        const [href, data] = mergeDataIntoQueryString('get', 'https://example.com/search', { q: 'foo' })

        expect(href).toBe('https://example.com/search?q=foo')
        expect(data).toEqual({})
      })

      test('maintains hash fragments when appending query parameters', () => {
        const [href, data] = mergeDataIntoQueryString('get', '/docs#section', { page: '1' })

        expect(href).toBe('/docs?page=1#section')
        expect(data).toEqual({})
      })

      test('replaces previous array values completely when using index notation', () => {
        // See: https://github.com/inertiajs/inertia/pull/2416
        const [href, data] = mergeDataIntoQueryString('get', '/edit?items[0]=a&items[1]=b', { items: ['c'] }, 'indices')

        expect(href).toBe('/edit?items[0]=c')
        expect(data).toEqual({})
      })

      test('replaces nested objects without merging with existing keys', () => {
        const [href, data] = mergeDataIntoQueryString('get', '/filter?filters[type]=a&filters[category]=b', {
          filters: { type: 'x' },
        })

        expect(href).toBe('/filter?filters[type]=x')
        expect(data).toEqual({})
      })

      test('retains indexed object keys in the query string during parsing and stringification', () => {
        // See: https://github.com/inertiajs/inertia/issues/2404
        const [href, data] = mergeDataIntoQueryString('get', '/search?filter[12]=213', { q: 'bar' })

        expect(href).toBe('/search?filter[12]=213&q=bar')
        expect(data).toEqual({})
      })

      test('handles empty arrays and objects', () => {
        const [href, data] = mergeDataIntoQueryString('get', '/filter', { tags: [], filters: {} })

        expect(href).toBe('/filter')
        expect(data).toEqual({})
      })

      test('handles nested arrays within objects', () => {
        const [href, data] = mergeDataIntoQueryString('get', '/filter', {
          filters: { tags: ['red', 'blue'], categories: ['A', 'B'] }
        })

        expect(href).toBe('/filter?filters[tags][]=red&filters[tags][]=blue&filters[categories][]=A&filters[categories][]=B')
        expect(data).toEqual({})
      })

      test('handles deep nesting of objects', () => {
        const [href, data] = mergeDataIntoQueryString('get', '/api', {
          user: { profile: { settings: { theme: 'dark' } } }
        })

        expect(href).toBe('/api?user[profile][settings][theme]=dark')
        expect(data).toEqual({})
      })

      test('handles URLs with fragments containing query-like syntax', () => {
        const [href, data] = mergeDataIntoQueryString('get', '/docs#section?param=value', { page: 2 })

        expect(href).toBe('/docs?page=2#section?param=value')
        expect(data).toEqual({})
      })

      test('handles query strings with keys but no values', () => {
        const [href, data] = mergeDataIntoQueryString('get', '/search?flag&other=value', { new: 'param' })

        expect(href).toBe('/search?flag=&other=value&new=param')
        expect(data).toEqual({})
      })

      test('handles URLs that are only query strings', () => {
        const [href, data] = mergeDataIntoQueryString('get', '?existing=value', { new: 'param' })

        expect(href).toBe('?existing=value&new=param')
        expect(data).toEqual({})
      })

      test('handles URLs that are only hash fragments', () => {
        const [href, data] = mergeDataIntoQueryString('get', '#section', { param: 'value' })

        expect(href).toBe('?param=value#section')
        expect(data).toEqual({})
      })

      test('handles already encoded values in URLs', () => {
        const [href, data] = mergeDataIntoQueryString('get', '/search?q=hello%20world', { filter: 'café' })

        expect(href).toBe('/search?q=hello%20world&filter=caf%C3%A9')
        expect(data).toEqual({})
      })

      test('handles arrays with mixed data types', () => {
        const [href, data] = mergeDataIntoQueryString('get', '/filter', {
          mixed: [1, 'string', true, null]
        })

        expect(href).toBe('/filter?mixed[]=1&mixed[]=string&mixed[]=true&mixed[]=')
        expect(data).toEqual({})
      })

      test('handles objects with numeric keys', () => {
        const [href, data] = mergeDataIntoQueryString('get', '/api', {
          items: { 0: 'first', 1: 'second', 10: 'tenth' }
        })

        expect(href).toBe('/api?items[0]=first&items[1]=second&items[10]=tenth')
        expect(data).toEqual({})
      })

      test('handles URL objects as input', () => {
        const url = new URL('https://example.com/search?existing=value')
        const [href, data] = mergeDataIntoQueryString('get', url, { new: 'param' })

        expect(href).toBe('https://example.com/search?existing=value&new=param')
        expect(data).toEqual({})
      })
    })

    test.describe('non-GET request', () => {
      test('leaves the href unchanged when data is present', () => {
        const [href, data] = mergeDataIntoQueryString('post', '/submit', { name: 'foo' })

        expect(href).toBe('/submit')
        expect(data).toEqual({ name: 'foo' })
      })

      test('retains the original query string and returns data untouched', () => {
        const [href, data] = mergeDataIntoQueryString('put', '/update?active=true', { name: 'bar' })

        expect(href).toBe('/update?active=true')
        expect(data).toEqual({ name: 'bar' })
      })

      test('preserves hash fragments in the href', () => {
        const [href, data] = mergeDataIntoQueryString('patch', '/docs#install', { step: '2' })

        expect(href).toBe('/docs#install')
        expect(data).toEqual({ step: '2' })
      })

      test('does not modify the query string even if data includes keys already present in the href', () => {
        const [href, data] = mergeDataIntoQueryString('delete', '/delete?confirm=yes', { confirm: 'no' })

        expect(href).toBe('/delete?confirm=yes')
        expect(data).toEqual({ confirm: 'no' })
      })

      test('handles absolute URLs without modifying the query string', () => {
        const [href, data] = mergeDataIntoQueryString('post', 'https://example.com/submit?token=abc', { token: 'xyz' })

        expect(href).toBe('https://example.com/submit?token=abc')
        expect(data).toEqual({ token: 'xyz' })
      })

      test('preserves complex data structures unchanged', () => {
        const complexData = {
          user: { profile: { settings: { theme: 'dark' } } },
          tags: ['red', 'blue'],
          active: true,
          count: 42
        }
        const [href, data] = mergeDataIntoQueryString('post', '/api/update', complexData)

        expect(href).toBe('/api/update')
        expect(data).toEqual(complexData)
      })

      test('handles URL objects as input for non-GET requests', () => {
        const url = new URL('https://example.com/api?existing=value#section')
        const [href, data] = mergeDataIntoQueryString('put', url, { new: 'data' })

        expect(href).toBe('https://example.com/api?existing=value#section')
        expect(data).toEqual({ new: 'data' })
      })
    })
  })
})
