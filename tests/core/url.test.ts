import test, { expect } from '@playwright/test'
import { config } from '../../packages/core/src/config'
import { mergeDataIntoQueryString, transformUrlAndData, urlHasProtocol } from '../../packages/core/src/url'

test.describe('url.ts', () => {
  test.describe('urlHasProtocol', () => {
    const trueCases = [
      ['https://example.com', 'https protocol'],
      ['http://example.com', 'http protocol'],
      ['ftp://files.example.com', 'ftp protocol'],
      ['custom-scheme://app', 'custom scheme with hyphen'],
      ['scheme123://app', 'scheme with numbers'],
      ['//example.com', 'protocol-relative URL'],
      ['//example.com/path', 'protocol-relative URL with path'],
      ['//example.com:8080', 'protocol-relative URL with port'],
      ['//localhost', 'protocol-relative localhost'],
    ] as const

    const falseCases = [
      ['/path', 'absolute path'],
      ['/path/to/page', 'nested absolute path'],
      ['path/to/page', 'relative path'],
      ['./path', 'relative path with dot'],
      ['../path', 'relative path with double dot'],
      ['?query=value', 'query string only'],
      ['#hash', 'hash only'],
      ['', 'empty string'],
      ['///path', 'triple slash'],
      ['///', 'triple slash only'],
      ['//', 'double slash only'],
    ] as const

    trueCases.forEach(([url, description]) => {
      test(`returns true for ${description}: ${url}`, () => {
        expect(urlHasProtocol(url)).toBe(true)
      })
    })

    falseCases.forEach(([url, description]) => {
      test(`returns false for ${description}: ${url}`, () => {
        expect(urlHasProtocol(url)).toBe(false)
      })
    })
  })

  test.describe('mergeDataIntoQueryString', () => {
    test.describe('GET request', () => {
      test('appends data to a URL without an existing query string', () => {
        const [href, data] = mergeDataIntoQueryString('get', '/search', { q: 'foo' })

        expect(href).toBe('/search?q=foo')
        expect(data).toEqual({})
      })

      test('returns the FormData instance when passed as data', () => {
        const formData = new FormData()
        formData.append('q', 'foo')

        const [href, data] = mergeDataIntoQueryString('post', '/search', formData)

        expect(href).toBe('/search')
        expect(data).toEqual(formData)
      })

      test('merges new data into an existing query string', () => {
        const [href, data] = mergeDataIntoQueryString('get', '/search?lang=en', { q: 'bar' })

        expect(href).toBe('/search?lang=en&q=bar')
        expect(data).toEqual({})
      })

      test('merges data into URL with existing brackets notation arrays', () => {
        const originalHref = '/search?frameworks[]=react&frameworks[]=vue'
        const additionalData = { q: 'bar' }

        const [hrefBrackts, dataBrackets] = mergeDataIntoQueryString('get', originalHref, additionalData, 'brackets')

        expect(hrefBrackts).toBe('/search?frameworks[]=react&frameworks[]=vue&q=bar')
        expect(dataBrackets).toEqual({})

        const [hrefIndices, dataIndices] = mergeDataIntoQueryString('get', originalHref, additionalData, 'indices')

        expect(hrefIndices).toBe('/search?frameworks[0]=react&frameworks[1]=vue&q=bar')
        expect(dataIndices).toEqual({})
      })

      test('merges data into URL with existing indices notation arrays', () => {
        const originalHref = '/search?frameworks[0]=react&frameworks[1]=vue'
        const additionalData = { q: 'bar' }

        const [hrefBrackts, dataBrackets] = mergeDataIntoQueryString('get', originalHref, additionalData, 'brackets')

        expect(hrefBrackts).toBe('/search?frameworks[0]=react&frameworks[1]=vue&q=bar')
        expect(dataBrackets).toEqual({})

        const [hrefIndices, dataIndices] = mergeDataIntoQueryString('get', originalHref, additionalData, 'indices')

        expect(hrefIndices).toBe('/search?frameworks[0]=react&frameworks[1]=vue&q=bar')
        expect(dataIndices).toEqual({})
      })

      test('merges data into URL with existing nested brackets notation arrays', () => {
        const originalHref = '/search?filters[tags][]=a&filters[tags][]=b'
        const additionalData = { q: 'bar' }

        const [hrefBrackets, dataBrackets] = mergeDataIntoQueryString('get', originalHref, additionalData, 'brackets')

        expect(hrefBrackets).toBe('/search?filters[tags][]=a&filters[tags][]=b&q=bar')
        expect(dataBrackets).toEqual({})

        const [hrefIndices, dataIndices] = mergeDataIntoQueryString('get', originalHref, additionalData, 'indices')

        expect(hrefIndices).toBe('/search?filters[tags][0]=a&filters[tags][1]=b&q=bar')
        expect(dataIndices).toEqual({})
      })

      test('merges data into URL with existing nested indices notation arrays', () => {
        const originalHref = '/search?filters[tags][0]=a&filters[tags][1]=b'
        const additionalData = { q: 'bar' }

        const [hrefBrackets, dataBrackets] = mergeDataIntoQueryString('get', originalHref, additionalData, 'brackets')

        expect(hrefBrackets).toBe('/search?filters[tags][0]=a&filters[tags][1]=b&q=bar')
        expect(dataBrackets).toEqual({})

        const [hrefIndices, dataIndices] = mergeDataIntoQueryString('get', originalHref, additionalData, 'indices')

        expect(hrefIndices).toBe('/search?filters[tags][0]=a&filters[tags][1]=b&q=bar')
        expect(dataIndices).toEqual({})
      })

      test('merges data into URL with single item at index 0', () => {
        const originalHref = '/search?items[0]=first'
        const additionalData = { q: 'bar' }

        const [hrefBrackets, dataBrackets] = mergeDataIntoQueryString('get', originalHref, additionalData, 'brackets')

        expect(hrefBrackets).toBe('/search?items[0]=first&q=bar')
        expect(dataBrackets).toEqual({})

        const [hrefIndices, dataIndices] = mergeDataIntoQueryString('get', originalHref, additionalData, 'indices')

        expect(hrefIndices).toBe('/search?items[0]=first&q=bar')
        expect(dataIndices).toEqual({})
      })

      test('merges data into URL with sparse array indices', () => {
        const originalHref = '/search?a[0]=x&a[5]=y'
        const additionalData = { q: 'bar' }

        const [hrefBrackets, dataBrackets] = mergeDataIntoQueryString('get', originalHref, additionalData, 'brackets')

        expect(hrefBrackets).toBe('/search?a[0]=x&a[5]=y&q=bar')
        expect(dataBrackets).toEqual({})

        const [hrefIndices, dataIndices] = mergeDataIntoQueryString('get', originalHref, additionalData, 'indices')

        expect(hrefIndices).toBe('/search?a[0]=x&a[5]=y&q=bar')
        expect(dataIndices).toEqual({})
      })

      test('merges data into URL with objects at array indices', () => {
        const originalHref = '/search?items[0][id]=1&items[0][name]=foo&items[1][id]=2'
        const additionalData = { q: 'bar' }

        const [hrefBrackets, dataBrackets] = mergeDataIntoQueryString('get', originalHref, additionalData, 'brackets')

        expect(hrefBrackets).toBe('/search?items[0][id]=1&items[0][name]=foo&items[1][id]=2&q=bar')
        expect(dataBrackets).toEqual({})

        const [hrefIndices, dataIndices] = mergeDataIntoQueryString('get', originalHref, additionalData, 'indices')

        expect(hrefIndices).toBe('/search?items[0][id]=1&items[0][name]=foo&items[1][id]=2&q=bar')
        expect(dataIndices).toEqual({})
      })

      test('merges data into URL with URL-encoded indices notation', () => {
        const originalHref = '/search?items%5B0%5D%5Bname%5D=foo&items%5B1%5D%5Bname%5D=bar'
        const additionalData = { q: 'baz' }

        const [href, data] = mergeDataIntoQueryString('get', originalHref, additionalData, 'brackets')

        expect(href).toBe('/search?items[0][name]=foo&items[1][name]=bar&q=baz')
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
          filters: { tags: ['red', 'blue'], categories: ['A', 'B'] },
        })

        expect(href).toBe(
          '/filter?filters[tags][]=red&filters[tags][]=blue&filters[categories][]=A&filters[categories][]=B',
        )
        expect(data).toEqual({})
      })

      test('handles deep nesting of objects', () => {
        const [href, data] = mergeDataIntoQueryString('get', '/api', {
          user: { profile: { settings: { theme: 'dark' } } },
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
          mixed: [1, 'string', true, null],
        })

        expect(href).toBe('/filter?mixed[]=1&mixed[]=string&mixed[]=true&mixed[]=')
        expect(data).toEqual({})
      })

      test('handles objects with numeric keys', () => {
        const [href, data] = mergeDataIntoQueryString('get', '/api', {
          items: { 0: 'first', 1: 'second', 10: 'tenth' },
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
          count: 42,
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

      test('handles a URL that is an empty string', () => {
        const [href, data] = mergeDataIntoQueryString('post', '', { name: 'foo' })

        expect(href).toBe('/')
        expect(data).toEqual({ name: 'foo' })
      })
    })
  })

  test.describe('transformUrlAndData', () => {
    test('accepts string URL as href parameter', () => {
      const inputUrl = 'https://example.com/page'
      const [url, data] = transformUrlAndData(inputUrl, { foo: 'bar' }, 'post', false, 'brackets')

      expect(url).toBeInstanceOf(URL)
      expect(url.href).toBe('https://example.com/page')
    })

    test('converts data to FormData when it contains files', () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' })
      const [url, data] = transformUrlAndData('https://example.com/upload', { file }, 'post', false, 'brackets')

      expect(data).toBeInstanceOf(FormData)
      expect((data as FormData).get('file')).toEqual(file)
    })

    test('converts data to FormData when forceFormData is true', () => {
      const [url, data] = transformUrlAndData('https://example.com/submit', { name: 'test' }, 'post', true, 'brackets')

      expect(data).toBeInstanceOf(FormData)
      expect((data as FormData).get('name')).toBe('test')
    })

    test('returns FormData unchanged when data is already FormData', () => {
      const formData = new FormData()
      formData.append('key', 'value')
      const [url, data] = transformUrlAndData('https://example.com/submit', formData, 'post', false, 'brackets')

      expect(data).toBe(formData)
      expect(data).toBeInstanceOf(FormData)
    })

    test('does not convert to FormData when forceFormData is false and no files present', () => {
      const [url, data] = transformUrlAndData('https://example.com/submit', { name: 'test' }, 'post', false, 'brackets')

      expect(data).not.toBeInstanceOf(FormData)
      expect(data).toEqual({ name: 'test' })
    })

    test('forces indices notation when converting arrays to FormData by default', () => {
      const [url, data] = transformUrlAndData(
        'https://example.com/submit',
        { tags: ['a', 'b'] },
        'post',
        true,
        'brackets',
      )

      expect(data).toBeInstanceOf(FormData)
      expect((data as FormData).get('tags[0]')).toBe('a')
      expect((data as FormData).get('tags[1]')).toBe('b')
    })

    test('can opt-out of forcing indices notation when converting arrays to FormData by default', () => {
      config.set('form.forceIndicesArrayFormatInFormData', false)

      const [url, data] = transformUrlAndData(
        'https://example.com/submit',
        { tags: ['a', 'b'] },
        'post',
        true,
        'brackets',
      )

      expect(data).toBeInstanceOf(FormData)
      expect((data as FormData).getAll('tags[]')).toEqual(['a', 'b'])
    })

    test('uses index notation when converting arrays to FormData with indices format', () => {
      const [url, data] = transformUrlAndData(
        'https://example.com/submit',
        { tags: ['a', 'b'] },
        'post',
        true,
        'indices',
      )

      expect(data).toBeInstanceOf(FormData)
      expect((data as FormData).get('tags[0]')).toBe('a')
      expect((data as FormData).get('tags[1]')).toBe('b')
    })

    test('handles nested objects when forceFormData is true', () => {
      const [url, data] = transformUrlAndData(
        'https://example.com/submit',
        { user: { name: 'John', age: 30 } },
        'post',
        true,
        'brackets',
      )

      expect(data).toBeInstanceOf(FormData)
      expect((data as FormData).get('user[name]')).toBe('John')
      expect((data as FormData).get('user[age]')).toBe('30')
    })

    test('returns FormData with file and does not merge into query string', () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' })
      const [url, data] = transformUrlAndData(
        'https://example.com/upload',
        { file, name: 'test' },
        'get',
        false,
        'brackets',
      )

      expect(data).toBeInstanceOf(FormData)
      expect(url.search).toBe('')
      expect((data as FormData).get('file')).toEqual(file)
      expect((data as FormData).get('name')).toBe('test')
    })

    test('handles absolute URLs with protocol', () => {
      const [url, data] = transformUrlAndData('https://example.com/page', { foo: 'bar' }, 'post', false, 'brackets')

      expect(url.protocol).toBe('https:')
      expect(url.host).toBe('example.com')
      expect(url.pathname).toBe('/page')
    })

    test('preserves existing query parameters and hash when returning FormData', () => {
      const [url, data] = transformUrlAndData(
        'https://example.com/page?existing=value#section',
        { name: 'test' },
        'post',
        true,
        'brackets',
      )

      expect(url.search).toBe('?existing=value')
      expect(url.hash).toBe('#section')
      expect(data).toBeInstanceOf(FormData)
    })
  })
})
