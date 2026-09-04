import { describe, expect, it } from 'vitest'
import createHeadManager, { resolveServerHead } from '../src/head'
import { LayerState, Page } from '../src/types'

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

const layer = (overrides: Partial<LayerState> = {}): LayerState => ({
  id: 'layer-1',
  key: 'Users/Edit',
  component: 'Users/Edit',
  props: {},
  url: '/users/5/edit',
  base: '/users',
  encryptHistory: false,
  standalone: true,
  entries: 0,
  owner: null,
  ...overrides,
})

const coldComposite = (headProps: Page['props'] = {}): Page =>
  ({
    ...page({ errors: {} }),
    component: '',
    layers: [layer({ component: 'SSR/Layer', props: { ...headProps } })],
  }) as Page

const warmComposite = (headProps: Page['props'], baseHeadProps: Page['props']): Page =>
  ({
    ...page({ errors: {}, ...baseHeadProps }),
    layers: [layer({ component: 'Users/Edit', standalone: false, props: { ...headProps } })],
  }) as Page

describe('createHeadManager', () => {
  describe('server head', () => {
    it('normalizes server head elements into Inertia managed elements', () => {
      expect(resolveServerHead(page(), () => ['<meta name="description" content="Users">'])).toEqual([
        '<meta data-inertia="server-head-0" name="description" content="Users">',
      ])
    })

    it('trims surrounding whitespace and drops empty entries', () => {
      expect(resolveServerHead(page(), () => ['  <meta name="description" content="Users">  ', '   ', ''])).toEqual([
        '<meta data-inertia="server-head-0" name="description" content="Users">',
      ])
    })

    it('can resolve server head elements from a page prop', () => {
      expect(resolveServerHead(page({ head: ['<title>Users</title>'] }), true)).toEqual([
        '<title data-inertia="server-head-0">Users</title>',
      ])
    })

    it('resolves a cold layer server head from the top layer when the base is blank', () => {
      expect(
        resolveServerHead(coldComposite({ head: ['<title>Layer</title>'] }), (p) => p.props.head as string[]),
      ).toEqual(['<title data-inertia="server-head-0">Layer</title>'])
    })

    it('resolves a cold layer server head from a named prop on the top layer', () => {
      expect(
        resolveServerHead(coldComposite({ metaTags: ['<meta name="description" content="Layer">'] }), 'metaTags'),
      ).toEqual(['<meta data-inertia="server-head-0" name="description" content="Layer">'])
    })

    it('resolves a warm layer server head from the top layer, not the base beneath it', () => {
      expect(
        resolveServerHead(warmComposite({ head: ['<title>Layer</title>'] }, { head: ['<title>Base</title>'] }), true),
      ).toEqual(['<title data-inertia="server-head-0">Layer</title>'])
    })

    it('returns no head for a cold layer that carries none', () => {
      expect(resolveServerHead(coldComposite(), true)).toEqual([])
      expect(resolveServerHead(coldComposite(), (p) => p.props.head as string[])).toEqual([])
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

  describe('stack order', () => {
    const stackOf =
      (...ids: string[]) =>
      () =>
        ids.map((id) => ({ id }) as LayerState)

    it('orders the page beneath the layers, the layers by their index, and keeps only the top title', () => {
      const collected: string[][] = []

      const manager = createHeadManager(
        true,
        (title) => title,
        (elements) => collected.push(elements),
        [],
        stackOf('layer-1', 'layer-2'),
      )

      const firstBase = manager.createProvider()
      const layerOne = manager.createProvider('layer-1')
      const layerTwo = manager.createProvider('layer-2')
      const secondBase = manager.createProvider()

      firstBase.update(['<meta data-inertia="first-base" content="first">'])
      secondBase.update(['<meta data-inertia="second-base" content="second">'])
      layerOne.update(['<title data-inertia="">Layer One</title>', '<meta data-inertia="one" content="1">'])
      layerTwo.update(['<title data-inertia="">Layer Two</title>'])

      expect(collected[collected.length - 1]).toEqual([
        '<meta data-inertia="first-base" content="first">',
        '<meta data-inertia="second-base" content="second">',
        '<title data-inertia="">Layer Two</title>',
        '<meta data-inertia="one" content="1">',
      ])
    })

    it("keeps the top layer's title when another layer is inserted beneath it", () => {
      const collected: string[][] = []

      let stack: LayerState[] = [{ id: 'outer' } as LayerState]

      const manager = createHeadManager(
        true,
        (title) => title,
        (elements) => collected.push(elements),
        [],
        () => stack,
      )

      const outer = manager.createProvider('outer')
      outer.update(['<title data-inertia="">Outer</title>'])

      stack = [{ id: 'inner' } as LayerState, { id: 'outer' } as LayerState]
      const inner = manager.createProvider('inner')
      inner.update(['<title data-inertia="">Inner</title>'])

      expect(collected[collected.length - 1]).toEqual(['<title data-inertia="">Outer</title>'])
    })

    it("keeps a layer's title winning over the page's when its provider disconnects and reconnects", () => {
      const collected: string[][] = []

      const manager = createHeadManager(
        true,
        (title) => title,
        (elements) => collected.push(elements),
        [],
        stackOf('layer-1'),
      )

      const layerOne = manager.createProvider('layer-1')
      const base = manager.createProvider()

      layerOne.update(['<title data-inertia="">Layer</title>'])
      base.update(['<title data-inertia="">Base</title>'])

      layerOne.disconnect()
      layerOne.reconnect()
      layerOne.update(['<title data-inertia="">Layer</title>'])

      expect(collected[collected.length - 1]).toEqual(['<title data-inertia="">Layer</title>'])
    })

    it('keeps the server head first', () => {
      const collected: string[][] = []

      const manager = createHeadManager(
        true,
        (title) => title,
        (elements) => collected.push(elements),
        ['<title data-inertia="server-head-0">Server Head</title>'],
        stackOf('layer-1'),
      )

      const layerOne = manager.createProvider('layer-1')
      layerOne.update(['<meta data-inertia="one" content="1">'])

      expect(collected[collected.length - 1]).toEqual([
        '<title data-inertia="server-head-0">Server Head</title>',
        '<meta data-inertia="one" content="1">',
      ])
    })
  })
})
