import { describe, expect, it } from 'vitest'
import createHeadManager, { resolveServerHead } from '../src/head'
import { Page } from '../src/types'

const page = (props: Page['props'] = {}): Page => ({
  component: 'Users/Index',
  props: {
    errors: {},
    ...props,
  },
  url: '/users',
  version: null,
  rescuedProps: [],
  flash: {},
  rememberedState: {},
})

describe('createHeadManager', () => {
  describe('server head', () => {
    it('normalizes server head elements into Inertia managed elements', () => {
      expect(resolveServerHead(page(), () => ['<meta name="description" content="Users">'])).toEqual([
        '<meta data-inertia="server-head-0" name="description" content="Users">',
      ])
    })

    it('trims surrounding whitespace and drops empty entries', () => {
      expect(
        resolveServerHead(page(), () => ['  <meta name="description" content="Users">  ', '   ', '']),
      ).toEqual(['<meta data-inertia="server-head-0" name="description" content="Users">'])
    })

    it('can resolve server head elements from a page prop', () => {
      expect(resolveServerHead(page({ head: ['<title>Users</title>'] }), true)).toEqual([
        '<title data-inertia="server-head-0">Users</title>',
      ])
    })

    it('updates server head elements using a reserved provider', () => {
      const collected: string[][] = []

      const manager = createHeadManager(
        true,
        (title) => title,
        (elements) => collected.push(elements),
        ['<meta data-inertia="description" name="description" content="Users">'],
      )

      manager.updateServerHead(['<meta data-inertia="description" name="description" content="Organizations">'])

      expect(collected[collected.length - 1]).toEqual([
        '<meta data-inertia="description" name="description" content="Organizations">',
      ])

      manager.updateServerHead()

      expect(collected[collected.length - 1]).toEqual([])
    })

    it('allows page head elements to override server head elements with the same key', () => {
      const collected: string[][] = []

      const manager = createHeadManager(
        true,
        (title) => title,
        (elements) => collected.push(elements),
        ['<meta data-inertia="description" name="description" content="Default">'],
      )

      const provider = manager.createProvider()
      provider.update(['<meta data-inertia="description" name="description" content="Page-specific">'])

      expect(collected[collected.length - 1]).toEqual([
        '<meta data-inertia="description" name="description" content="Page-specific">',
      ])
    })

    it('deduplicates single-quoted data-inertia keys', () => {
      const collected: string[][] = []

      const manager = createHeadManager(
        true,
        (title) => title,
        (elements) => collected.push(elements),
        ["<meta data-inertia='description' name='description' content='Default'>"],
      )

      const provider = manager.createProvider()
      provider.update(["<meta data-inertia='description' name='description' content='Page-specific'>"])

      expect(collected[collected.length - 1]).toEqual([
        "<meta data-inertia='description' name='description' content='Page-specific'>",
      ])
    })
  })

  describe('SSR title escaping', () => {
    it('escapes HTML in the title element to prevent XSS injection via newline bypass', () => {
      const collected: string[][] = []

      const manager = createHeadManager(
        true,
        (title) => title,
        (elements) => collected.push(elements),
      )

      const provider = manager.createProvider()
      provider.update([`<title data-inertia="">Safe Title\n</title><script>alert('xss')</script></title>`])

      const head = collected[collected.length - 1].join('')

      expect(head).not.toContain('<script>alert(')
    })
  })
})
