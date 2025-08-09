import test, { expect } from '@playwright/test'
import { mergeDataIntoQueryString, appURL, asset } from '../../packages/core/src/url'

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

test.describe('appURL and asset helpers', () => {
  test.describe('appURL (SSR)', () => {
    test('returns empty when no env and no fallback (SSR)', () => {
      const g = globalThis as unknown as { process?: { env?: Record<string, string> } }
      const oldAppUrl = g.process?.env?.APP_URL
      const oldViteAppUrl = g.process?.env?.VITE_APP_URL
      if (g.process?.env) {
        delete g.process.env.APP_URL
        delete g.process.env.VITE_APP_URL
      }
      ;(globalThis as any).window = undefined

      expect(appURL()).toBe('')

      if (g.process?.env) {
        if (oldAppUrl !== undefined) g.process.env.APP_URL = oldAppUrl
        if (oldViteAppUrl !== undefined) g.process.env.VITE_APP_URL = oldViteAppUrl
      }
    })

    test('uses explicit fallback when provided (SSR)', () => {
  ;(globalThis as any).window = undefined
      expect(appURL('example.com')).toBe('example.com')
      expect(appURL('http://example.com:8080')).toBe('example.com:8080')
    })

    test('parses APP_URL with protocol and default/non-default ports (SSR)', () => {
  const g: any = globalThis as any
  const oldAppUrl = g.process?.env?.APP_URL
  ;(globalThis as any).window = undefined

  if (!g.process) g.process = {}
  if (!g.process.env) g.process.env = {}
  g.process.env.APP_URL = 'https://example.com'
      expect(appURL()).toBe('example.com')

  g.process.env.APP_URL = 'http://example.com:8080'
      expect(appURL()).toBe('example.com:8080')

  g.process.env.APP_URL = 'example.com:443'
      expect(appURL()).toBe('example.com')

  // Restore
  if (oldAppUrl !== undefined) g.process.env.APP_URL = oldAppUrl
  else delete g.process.env.APP_URL
    })
  })

  test.describe('asset (SSR)', () => {
    test('returns site-relative path when no host is known (SSR)', () => {
      const g: any = globalThis as any
      const oldAppUrl = g.process?.env?.APP_URL
      const oldViteAppUrl = g.process?.env?.VITE_APP_URL
      if (g.process?.env) {
        delete g.process.env.APP_URL
        delete g.process.env.VITE_APP_URL
      }
      ;(globalThis as any).window = undefined

      const url = asset('css/app.css')
      expect(url).toBe('/css/app.css')

      if (g.process?.env) {
        if (oldAppUrl !== undefined) g.process.env.APP_URL = oldAppUrl
        if (oldViteAppUrl !== undefined) g.process.env.VITE_APP_URL = oldViteAppUrl
      }
    })

    test('uses fallbackUrl with https by default (SSR)', () => {
  ;(globalThis as any).window = undefined
      const url = asset('build/app.js', { fallbackUrl: 'example.com' })
      expect(url).toBe('https://example.com/build/app.js')
    })

    test('respects secure=false (SSR)', () => {
  ;(globalThis as any).window = undefined
      const url = asset('build/app.js', { fallbackUrl: 'example.com', secure: false })
      expect(url).toBe('http://example.com/build/app.js')
    })

    test('uses APP_URL protocol and host (SSR)', () => {
  const g: any = globalThis as any
  const oldAppUrl = g.process?.env?.APP_URL
  if (!g.process) g.process = {}
  if (!g.process.env) g.process.env = {}
  g.process.env.APP_URL = 'http://foo.test:3000'
  ;(globalThis as any).window = undefined
      const url = asset('img/logo.png')
      expect(url).toBe('http://foo.test:3000/img/logo.png')
  if (oldAppUrl !== undefined) g.process.env.APP_URL = oldAppUrl
  else delete g.process.env.APP_URL
    })
  })

  test.describe('asset (Browser)', () => {
    test('builds absolute URL based on window.location (default ports)', () => {
      ;(globalThis as any).window = {
        location: { protocol: 'https:', host: 'example.com', hostname: 'example.com', port: '' },
      }
      const url = asset('file.json')
      expect(url).toBe('https://example.com/file.json')
    })

    test('builds absolute URL with non-default port', () => {
  ;(globalThis as any).window = {
        location: { protocol: 'https:', host: 'example.com:8080', hostname: 'example.com', port: '8080' },
      }
      const url = asset('file.json')
      expect(url).toBe('https://example.com:8080/file.json')
    })

    test('injects preload link once and avoids duplicates', () => {
  const appended: any[] = []
  ;(globalThis as any).document = {
        head: {
          querySelectorAll: () => appended.filter((el) => el.rel === 'preload'),
          appendChild: (el: any) => appended.push(el),
        },
        createElement: (_tag: string) => ({ rel: '', as: '', href: '', type: '', setAttribute(name: string, value: string){ (this as any)[name] = value } }),
      }
  ;(globalThis as any).window = { location: { protocol: 'https:', host: 'example.com', hostname: 'example.com', port: '' } }

      const url1 = asset('styles/app.css', { preload: true })
      expect(url1).toBe('https://example.com/styles/app.css')
      expect(appended.length).toBe(1)
      expect(appended[0].rel).toBe('preload')
      expect(appended[0].as).toBe('style')
      expect(appended[0].href).toBe(url1)

      const url2 = asset('styles/app.css', { preload: true })
      expect(url2).toBe(url1)
      expect(appended.length).toBe(1)
    })
  })
})
