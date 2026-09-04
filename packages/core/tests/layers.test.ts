import { describe, expect, it } from 'vitest'
import {
  addressOf,
  capturedBaseIsValid,
  closeLayer,
  composeColdLayer,
  composeLayer,
  composeLocalLayer,
  dropHistoryEntry,
  encryptsHistory,
  entriesToUnwind,
  insertLayerBeneath,
  isLayerResponse,
  layerPageOf,
  layoutPageOf,
  loadingBase,
  nextLayerId,
  normalizeLoading,
  openLayerFor,
  promoteDeepestLayer,
  promoteLayer,
  recordHistoryEntry,
  resolveInitialPage,
  withAddressHash,
} from '../src/layers'
import { createLayoutPropsStore } from '../src/layout'
import { page as currentPage } from '../src/page'
import { LayerState, Page, ResolvedLayer } from '../src/types'
import { pageWith } from './support/layers'

describe('isLayerResponse', () => {
  it('is true when the response carries a layer mark', () => {
    expect(isLayerResponse(pageWith({ layer: { key: 'Users/Edit' } }))).toBe(true)
  })

  it('is true for a layer mark that declares nothing', () => {
    expect(isLayerResponse(pageWith({ layer: {} }))).toBe(true)
  })

  it('is false for an ordinary page response', () => {
    expect(isLayerResponse(pageWith())).toBe(false)
  })

  it('is false when the layer mark is null', () => {
    expect(isLayerResponse(pageWith({ layer: null } as Partial<Page>))).toBe(false)
  })
})

describe('nextLayerId', () => {
  it("skips ids already on the base's stack", () => {
    const base = composeLayer(pageWith(), pageWith({ component: 'A', layer: { key: 'A' } }), 'layer-1')

    expect(nextLayerId(base)).not.toBe('layer-1')
  })

  it('does not collide with a restored stack after the counter resets', () => {
    const restored = {
      ...pageWith(),
      layers: [
        {
          id: 'layer-1',
          key: 'A',
          component: 'A',
          props: {},
          url: '/a',
          base: null,
          encryptHistory: false,
          standalone: false,
          entries: 1,
          owner: null,
        },
      ],
    }

    expect(restored.layers.map((layer) => layer.id)).not.toContain(nextLayerId(restored))
  })

  it('gives every layer on a stack a different id', () => {
    let page = pageWith()

    for (let i = 0; i < 3; i++) {
      page = composeLayer(page, pageWith({ component: `C${i}`, layer: { key: `C${i}` } }), nextLayerId(page))
    }

    expect(new Set(page.layers!.map((layer) => layer.id)).size).toBe(3)
  })
})

describe('composeLayer', () => {
  const base = pageWith()
  const response = pageWith({
    component: 'Users/Edit',
    props: { user: { id: 5 } },
    url: '/users/5/edit',
    layer: { key: 'Users/Edit', base: '/users' },
  })

  it('keeps the page it composes onto as the base', () => {
    const composed = composeLayer(base, response, 'layer-1')

    expect(composed.component).toBe('Users/Index')
    expect(composed.url).toBe('/users')
    expect(composed.props).toEqual({ users: [] })
  })

  it('appends the response as a layer', () => {
    const composed = composeLayer(base, response, 'layer-1')

    expect(composed.layers).toEqual([
      {
        id: 'layer-1',
        key: 'Users/Edit',
        renderKey: expect.any(Number),
        component: 'Users/Edit',
        props: { user: { id: 5 } },
        url: '/users/5/edit',
        base: '/users',
        encryptHistory: false,
        standalone: false,
        entries: 0,
        owner: null,
        deferredProps: {},
        rescuedProps: [],
        flash: {},
        onceProps: {},
        scrollProps: {},
      },
    ])
  })

  it('does not mark a layer opened over a page as standalone', () => {
    expect(composeLayer(base, response, 'layer-1').layers![0].standalone).toBe(false)
  })

  it('marks a layer opened over nothing as standalone', () => {
    expect(composeLayer(base, response, 'layer-1', { url: response.url, standalone: true }).layers![0].standalone).toBe(
      true,
    )
  })

  it('defaults the key to the component name when the key is empty', () => {
    const composed = composeLayer(base, pageWith({ component: 'Users/Edit', layer: { key: '' } }), 'layer-1')

    expect(composed.layers![0].key).toBe('Users/Edit')
  })

  it('defaults the key to the component name when the layer declares none', () => {
    const composed = composeLayer(base, pageWith({ component: 'Users/Edit', layer: {} }), 'layer-1')

    expect(composed.layers![0].key).toBe('Users/Edit')
  })

  it('carries a null base when none was declared', () => {
    const withoutBase = { ...response, layer: { key: 'Users/Edit' } }

    expect(composeLayer(base, withoutBase as Page, 'layer-1').layers![0].base).toBeNull()
  })

  it('stacks onto layers already present', () => {
    const first = composeLayer(base, response, 'layer-1')
    const second = composeLayer(first, pageWith({ component: 'Teams/Show', layer: { key: 'Teams/Show' } }), 'layer-2')

    expect(second.layers!.map((layer) => layer.id)).toEqual(['layer-1', 'layer-2'])
    expect(second.component).toBe('Users/Index')
  })

  it('rewrites a layer whose key is already open, at its index', () => {
    const open = composeLayer(base, response, 'layer-1')
    const invalid = { ...response, props: { user: { id: 5 }, errors: { name: 'The name field is required.' } } }

    const composed = composeLayer(open, invalid, 'layer-9')

    expect(composed.layers).toHaveLength(1)
    expect(composed.layers![0].props).toEqual({ user: { id: 5 }, errors: { name: 'The name field is required.' } })
  })

  it('leaves the layers above the one it rewrites where they are', () => {
    const open = composeLayer(
      composeLayer(base, response, 'layer-1'),
      pageWith({ component: 'Teams/Show', layer: { key: 'Teams/Show' } }),
      'layer-2',
    )

    const composed = composeLayer(open, response, 'layer-9')

    expect(composed.layers!.map((layer) => layer.id)).toEqual(['layer-1', 'layer-2'])
    expect(composed.layers![1]).toEqual(open.layers![1])
  })

  it('keeps the id of the layer it rewrites', () => {
    const open = composeLayer(base, response, 'layer-1')

    expect(composeLayer(open, response, 'layer-9').layers![0].id).toBe('layer-1')
  })

  it('keeps whether the layer it rewrites was standalone', () => {
    const open = composeLayer(base, response, 'layer-1', { url: response.url, standalone: true })

    expect(composeLayer(open, response, 'layer-9').layers![0].standalone).toBe(true)
  })

  it('appends a second layer of the same component opened under another key', () => {
    const open = composeLayer(base, response, 'layer-1')

    const composed = composeLayer(open, { ...response, layer: { ...response.layer, key: 'Users/Edit:6' } }, 'layer-2')

    expect(composed.layers!.map((layer) => layer.id)).toEqual(['layer-1', 'layer-2'])
  })

  it('does not rewrite an open key when the new layer is standalone', () => {
    const open = composeLayer(base, response, 'layer-1')

    const composed = composeLayer(open, response, 'layer-2', { url: response.url, standalone: true })

    expect(composed.layers).toHaveLength(2)
    expect(composed.layers).toContainEqual(expect.objectContaining({ id: 'layer-1', standalone: false }))
  })

  it('does not mutate the stack it rewrites', () => {
    const open = composeLayer(base, response, 'layer-1')
    const openCopy = structuredClone(open)

    composeLayer(open, response, 'layer-9')

    expect(open).toEqual(openCopy)
  })

  it('does not mutate either input', () => {
    const baseCopy = structuredClone(base)
    const responseCopy = structuredClone(response)

    composeLayer(base, response, 'layer-1')

    expect(base).toEqual(baseCopy)
    expect(response).toEqual(responseCopy)
  })

  it('strips the layer mark from the layer it composes', () => {
    const layer = composeLayer(base, response, 'layer-1').layers![0]

    expect(layer).not.toHaveProperty('layer')
  })

  it('updates initialDeferredProps when a rewrite brings new deferred groups', () => {
    const open = composeLayer(base, { ...response, deferredProps: { default: ['stats'] } }, 'layer-1')

    expect(open.layers![0].initialDeferredProps).toEqual({ default: ['stats'] })

    const rewritten = composeLayer(open, { ...response, deferredProps: { default: ['history'] } }, 'layer-9')

    expect(rewritten.layers![0].initialDeferredProps).toEqual({ default: ['history'] })
  })
})

describe('insertLayerBeneath', () => {
  const cold = pageWith({
    component: 'Users/Edit',
    props: { user: { id: 5 } },
    url: '/users/5/edit',
    layer: { key: 'Users/Edit', base: '/users' },
  })

  const stack = composeLayer(
    pageWith({ component: 'Dashboard', props: { stats: 3 }, url: '/dashboard' }),
    cold,
    'layer-1',
    { url: cold.url, standalone: true },
  )

  const fetched = pageWith({
    component: 'Users/Index',
    props: { users: [] },
    url: '/users',
    layer: { key: 'Users/Index', base: '/dashboard' },
  })

  it('inserts the fetched base as the bottom layer', () => {
    expect(insertLayerBeneath(stack, fetched, 'layer-2').layers![0]).toEqual({
      id: 'layer-2',
      key: 'Users/Index',
      renderKey: expect.any(Number),
      component: 'Users/Index',
      props: { users: [] },
      url: '/users',
      base: '/dashboard',
      encryptHistory: false,
      standalone: true,
      entries: 0,
      owner: null,
      deferredProps: {},
      rescuedProps: [],
      flash: {},
      onceProps: {},
      scrollProps: {},
    })
  })

  it('keeps the page beneath the stack as the base', () => {
    const walked = insertLayerBeneath(stack, fetched, 'layer-2')

    expect(walked.component).toBe('Dashboard')
    expect(walked.url).toBe('/dashboard')
    expect(walked.props).toEqual({ stats: 3 })
  })

  it('strips the layer mark from the page', () => {
    const walked = insertLayerBeneath(stack, fetched, 'layer-2')

    expect(walked).not.toHaveProperty('layer')
  })

  it('leaves the layers above it exactly where they were', () => {
    const hop = insertLayerBeneath(stack, fetched, 'layer-2')
    const walked = insertLayerBeneath(
      hop,
      pageWith({ component: 'Teams/Show', layer: { key: 'Teams/Show' } }),
      'layer-3',
    )

    expect(walked.layers!.map((layer) => layer.id)).toEqual(['layer-3', 'layer-2', 'layer-1'])
    expect(walked.layers![1]).toBe(hop.layers![0])
    expect(walked.layers![2]).toBe(hop.layers![1])
  })

  it('marks the inserted layer standalone, like the ones above it', () => {
    const walked = insertLayerBeneath(stack, fetched, 'layer-2')

    expect(walked.layers!.map((layer) => layer.standalone)).toEqual([true, true])
  })

  it('does not rewrite a layer already open under the same key', () => {
    const walked = insertLayerBeneath(stack, cold, 'layer-2')

    expect(walked.layers!.map((layer) => layer.id)).toEqual(['layer-2', 'layer-1'])
  })

  it('does not mutate the page it is given', () => {
    const stackCopy = structuredClone(stack)

    insertLayerBeneath(stack, fetched, 'layer-2')

    expect(stack).toEqual(stackCopy)
  })
})

describe('composeColdLayer', () => {
  const cold = pageWith({
    component: 'Users/Edit',
    props: { user: { id: 5 } },
    url: '/users/5/edit',
    layer: { key: 'Users/Edit', base: '/users' },
  })

  it('leaves the page blank until the base beneath the layer is fetched', () => {
    expect(composeColdLayer(cold, 'layer-1').component).toBe('')
  })

  it('sets the page url to the base it is fetching', () => {
    expect(composeColdLayer(cold, 'layer-1').url).toBe('/users')
  })

  it('marks the layer standalone, since nothing was ever beneath it', () => {
    expect(composeColdLayer(cold, 'layer-1').layers).toEqual([
      expect.objectContaining({ id: 'layer-1', key: 'Users/Edit', url: '/users/5/edit', standalone: true }),
    ])
  })

  it('gives the layer no url of its own when the visit preserved the url', () => {
    expect(composeColdLayer(cold, 'layer-1', null).layers![0].url).toBeNull()
  })

  it('strips the layer mark from the page', () => {
    const page = composeColdLayer(cold, 'layer-1')

    expect(page).not.toHaveProperty('layer')
  })

  it('keeps the errors the layer arrived with off the page beneath it', () => {
    const page = composeColdLayer(
      { ...cold, props: { user: { id: 5 }, errors: { name: 'Required.' } } } as Page,
      'layer-1',
    )

    expect(page.props).toEqual({ errors: {} })
  })

  it('carries the flash the layer arrived with onto the page beneath it', () => {
    const page = composeColdLayer({ ...cold, flash: { message: 'Saved.' } } as Page, 'layer-1')

    expect(page.flash).toEqual({ message: 'Saved.' })
  })
})

describe('resolveInitialPage', () => {
  const resolve = (name: string) => ({ name }) as never

  const layerAt = (url: string, component: string, base?: string): Page =>
    pageWith({ component, url, layer: { key: component, base }, props: {} })

  it('leaves a response that is not a layer exactly as it arrived', async () => {
    const response = pageWith()

    const { page, component, layers } = await resolveInitialPage(response, resolve)

    expect(page).toBe(response)
    expect(component).toEqual({ name: 'Users/Index' })
    expect(layers).toEqual([])
  })

  it('opens a layer loaded cold over a base that has not arrived yet', async () => {
    const { page, component, layers } = await resolveInitialPage(
      layerAt('/users/5/edit', 'Users/Edit', '/users'),
      resolve,
    )

    expect(page.component).toBe('')
    expect(page.url).toBe('/users')
    expect(component).toBeUndefined()
    expect(layers).toEqual([
      expect.objectContaining({ key: 'Users/Edit', component: { name: 'Users/Edit' }, isClosing: false }),
    ])
  })

  it('renders a layer that declares no base as an ordinary page', async () => {
    const { page, component, layers } = await resolveInitialPage(layerAt('/users/5/edit', 'Users/Edit'), resolve)

    expect(page.component).toBe('Users/Edit')
    expect(page).not.toHaveProperty('layer')
    expect(component).toEqual({ name: 'Users/Edit' })
    expect(layers).toEqual([])
  })

  it('renders a layer whose base is its own url as an ordinary page', async () => {
    const { page } = await resolveInitialPage(layerAt('/users/5/edit', 'Users/Edit', '/users/5/edit'), resolve)

    expect(page.component).toBe('Users/Edit')
    expect(page.layers).toBeUndefined()
    expect(page).not.toHaveProperty('layer')
  })

  it('does not touch the response it was given', async () => {
    const response = layerAt('/users/5/edit', 'Users/Edit', '/users')
    const copy = structuredClone(response)

    await resolveInitialPage(response, resolve)

    expect(response).toEqual(copy)
  })

  it("puts the browser's hash on the layer that owns the address", async () => {
    window.location.href = 'http://localhost/users/5/edit#profile'

    const { page } = await resolveInitialPage(layerAt('/users/5/edit', 'Users/Edit', '/users'), resolve)

    expect(page.layers![0].url).toBe('/users/5/edit#profile')
    expect(page.url).toBe('/users')

    window.location.href = 'http://localhost/users'
  })

  it('does not append the hash to a url that already carries it', async () => {
    window.location.href = 'http://localhost/users/5/edit#profile'

    const { page } = await resolveInitialPage(layerAt('/users/5/edit#profile', 'Users/Edit', '/users'), resolve)

    expect(page.layers![0].url).toBe('/users/5/edit#profile')

    window.location.href = 'http://localhost/users'
  })

  it('resolves the base a cold open is missing through the loading resolver', async () => {
    const seen: [string, Page][] = []
    const resolveLoading = (url: string, page: Page) => {
      seen.push([url, page])

      return { name: 'Loading' } as never
    }

    const { page, component } = await resolveInitialPage(
      layerAt('/users/5/edit', 'Users/Edit', '/users'),
      resolve,
      resolveLoading,
    )

    expect(component).toEqual({ name: 'Loading' })
    expect(seen).toEqual([['/users', page]])
    expect(page.layers!.map((layer) => layer.key)).toEqual(['Users/Edit'])
  })

  it('never calls the loading resolver for an ordinary page', async () => {
    const resolveLoading = () => {
      throw new Error('consulted')
    }

    const { component } = await resolveInitialPage(pageWith(), resolve, resolveLoading)

    expect(component).toEqual({ name: 'Users/Index' })
  })
})

describe('loadingBase', () => {
  const blank = () =>
    composeColdLayer(
      pageWith({ component: 'Users/Edit', url: '/users/5/edit', layer: { key: 'Users/Edit', base: '/users' } }),
      'layer-1',
    )

  it('is the base the blank page is waiting on', () => {
    expect(loadingBase(blank())).toBe('/users')
  })

  it("is the blank page's own url once the layer above it has gone", () => {
    const { layers: _layers, ...dismissed } = blank()

    expect(loadingBase(dismissed as Page)).toBe('/users')
  })

  it('is undefined for a blank with no url at all', () => {
    expect(loadingBase({ ...pageWith(), component: '', url: '' })).toBeUndefined()
  })

  it('is undefined for a page that has a component', () => {
    expect(loadingBase(pageWith())).toBeUndefined()
  })
})

describe('normalizeLoading', () => {
  const page = pageWith()

  it('is undefined when no option was given', () => {
    expect(normalizeLoading(undefined)).toBeUndefined()
  })

  it('resolves a component as itself', async () => {
    const component = { render: () => null }

    await expect(normalizeLoading(component)!('/users', page)).resolves.toBe(component)
  })

  it('resolves a module to the component it carries', async () => {
    const component = { render: () => null }

    await expect(normalizeLoading({ default: component })!('/users', page)).resolves.toBe(component)
  })

  it('hands a resolver the url and the page, and resolves what it returns', async () => {
    const component = { render: () => null }
    const seen: unknown[] = []
    const resolver = normalizeLoading((url: string, resolved: Page) => {
      seen.push(url, resolved)

      return component
    })

    await expect(resolver!('/users', page)).resolves.toBe(component)
    expect(seen).toEqual(['/users', page])
  })

  it('unwraps the module a resolver imports', async () => {
    const component = { render: () => null }

    await expect(normalizeLoading(() => Promise.resolve({ default: component }))!('/users', page)).resolves.toBe(
      component,
    )
  })

  it('resolves nothing when the resolver declines', async () => {
    await expect(normalizeLoading(() => undefined)!('/users', page)).resolves.toBeUndefined()
  })

  it('resolves a component that throws when called as itself', async () => {
    const component = () => {
      throw new Error('not a resolver')
    }

    await expect(normalizeLoading(component)!('/users', page)).resolves.toBe(component)
  })

  it('resolves a component whose call the rendered check recognises as itself', async () => {
    const component = () => ({ vnode: true })

    const resolver = normalizeLoading(component, { rendered: (value) => (value as { vnode?: boolean }).vnode === true })

    await expect(resolver!('/users', page)).resolves.toBe(component)
  })
})

describe('resolving a blank base through the page', () => {
  const init = (resolveLoading?: (url: string, page: Page) => never) =>
    currentPage.init({
      initialPage: pageWith(),
      resolveComponent: (name) => ({ name }) as never,
      resolveLoading,
      swapComponent: async () => {},
    })

  const blank = () =>
    composeColdLayer(
      pageWith({ component: 'Users/Edit', url: '/users/5/edit', layer: { key: 'Users/Edit', base: '/users' } }),
      'layer-1',
    )

  it('resolves the placeholder for the base the blank is missing', async () => {
    init((url, page) => ({ name: `loading:${url}:${page.layers!.length}` }) as never)

    await expect(currentPage.resolve('', blank())).resolves.toEqual({ name: 'loading:/users:1' })
  })

  it('resolves the placeholder for a blank page whose layer was dismissed', async () => {
    init((url) => ({ name: `loading:${url}` }) as never)
    const { layers: _layers, ...dismissed } = blank()

    await expect(currentPage.resolve('', dismissed as Page)).resolves.toEqual({ name: 'loading:/users' })
  })

  it('resolves nothing without a loading resolver', async () => {
    init()

    await expect(currentPage.resolve('', blank())).resolves.toBeUndefined()
  })

  it('never sends a blank page to the ordinary resolver', async () => {
    const named: string[] = []
    currentPage.init({
      initialPage: pageWith(),
      resolveComponent: (name) => {
        named.push(name)

        return { name } as never
      },
      swapComponent: async () => {},
    })

    await currentPage.resolve('', blank())

    expect(named).toEqual([])
  })
})

describe('layerPageOf', () => {
  const layer = (overrides: Partial<LayerState> = {}): LayerState => ({
    id: 'layer-1',
    key: 'Users/Edit',
    component: 'Users/Edit',
    props: { user: { id: 5 }, errors: { name: 'required' } },
    url: '/users/5/edit',
    base: '/users',
    encryptHistory: false,
    standalone: false,
    entries: 1,
    owner: null,
    ...overrides,
  })

  it("swaps in the layer's component, props and url in place of the page's", () => {
    const page = layerPageOf(pageWith({ version: 'v9', clearHistory: true }), layer())

    expect(page.component).toBe('Users/Edit')
    expect(page.props).toEqual({ user: { id: 5 }, errors: { name: 'required' } })
    expect(page.url).toBe('/users/5/edit')
  })

  it('keeps the global version and clearHistory for the layer', () => {
    const page = layerPageOf(pageWith({ version: 'v9', clearHistory: true }), layer())

    expect(page.version).toBe('v9')
    expect(page.clearHistory).toBe(true)
  })

  it("reads errors from the layer's own props, not the page's", () => {
    const page = layerPageOf(pageWith({ props: { errors: { other: 'x' } } }), layer())

    expect(page.props.errors).toEqual({ name: 'required' })
  })

  it('falls back to the address for a layer with no url of its own', () => {
    const base = pageWith({ url: '/users' })
    const page = layerPageOf(base, layer({ url: null }))

    expect(page.url).toBe(addressOf(base))
  })

  it('falls back to the address beneath it, never the address of a layer above it', () => {
    const local = layer({ id: 'layer-1', url: null })
    const above = layer({ id: 'layer-2', url: '/users/9/notes' })
    const page = { ...pageWith({ url: '/users' }), layers: [local, above] }

    expect(layerPageOf(page, local).url).toBe('/users')
    expect(layerPageOf(page, above).url).toBe('/users/9/notes')
  })

  it('carries the full stack as layers', () => {
    const base = composeLayer(pageWith(), pageWith({ component: 'A', layer: { key: 'A' } }), 'layer-1')
    const page = layerPageOf(base, layer())

    expect(page.layers).toEqual(base.layers)
    expect(page.layers!.map((open) => open.id)).toEqual(['layer-1'])
  })

  it('takes encryptHistory from the layer, never from the page beneath it', () => {
    const page = layerPageOf(pageWith({ encryptHistory: true }), layer({ encryptHistory: false }))

    expect(page.encryptHistory).toBe(false)
  })

  it("reads the flash the layer itself carries, never the page's", () => {
    const page = layerPageOf(pageWith({ flash: { message: 'composite' } }), layer({ flash: { message: 'layer' } }))

    expect(page.flash).toEqual({ message: 'layer' })
  })

  it("resolves a layer component with the layer's own page, not the whole page", async () => {
    const resolved: Array<[string, Page | undefined]> = []
    currentPage.init({
      initialPage: pageWith(),
      resolveComponent: (name, page) => {
        resolved.push([name, page])
        return { name } as never
      },
      swapComponent: async () => {},
    })

    const composed = composeLayer(
      currentPage.get(),
      pageWith({
        component: 'Users/Edit',
        url: '/users/5/edit',
        layer: { key: 'Users/Edit' },
        props: { user: { id: 5 } },
      }),
      'layer-1',
    )
    await currentPage.set(composed, { preservesBase: true })

    const layerResolve = resolved.find(([name]) => name === 'Users/Edit')

    expect(layerResolve).toBeDefined()
    expect(layerResolve![1]).toEqual(layerPageOf(composed, composed.layers![0]))
  })
})

describe('layoutPageOf', () => {
  const resolved = (overrides: Partial<ResolvedLayer> = {}): ResolvedLayer =>
    ({
      id: 'layer-1',
      key: 'Users/Edit',
      component: {},
      page: pageWith({
        component: 'Users/Edit',
        url: '/users/5/edit',
        props: { user: { id: 5 }, errors: { name: 'required' } },
      }),
      url: '/users/5/edit',
      base: '/users',
      encryptHistory: false,
      standalone: false,
      entries: 1,
      owner: null,
      isClosing: false,
      ...overrides,
    }) as ResolvedLayer

  it('leaves the url empty for a layer with no url of its own, so it never reaches the address', () => {
    const page = layoutPageOf(resolved({ url: null }))

    expect(page.component).toBe('Users/Edit')
    expect(page.props).toEqual({ user: { id: 5 }, errors: { name: 'required' } })
    expect(page.url).toBe('')
  })

  it('keeps the layer url when the layer has one', () => {
    expect(layoutPageOf(resolved()).url).toBe('/users/5/edit')
  })
})

describe('createLayoutPropsStore, per-layer slots', () => {
  it("writes a layer's layout props to that layer alone, leaving the page's untouched", () => {
    const store = createLayoutPropsStore()

    store.set({ base: 'chrome' })
    store.set({ fromLayer: 'panel' }, 'layer-1')

    expect(store.getForLayer('layer-1')).toEqual({ shared: { fromLayer: 'panel' }, named: {} })
    expect(store.getForLayer('layer-2')).toEqual({ shared: {}, named: {} })
    expect(store.get()).toEqual({ shared: { base: 'chrome' }, named: {} })
  })

  it('writes a named slot beside the shared one for the same layer', () => {
    const store = createLayoutPropsStore()

    store.set('header', { title: 'Settings' }, 'layer-1')
    store.set({ fromLayer: 'panel' }, 'layer-1')

    expect(store.getForLayer('layer-1')).toEqual({
      shared: { fromLayer: 'panel' },
      named: { header: { title: 'Settings' } },
    })
  })

  it('retainLayers drops every slot outside the stack; reset() leaves the layer slots alone', () => {
    const store = createLayoutPropsStore()

    store.set({ base: 'chrome' })
    store.set({ fromLayer: 'panel' }, 'layer-1')
    store.set({ other: 'x' }, 'layer-2')
    store.set({ kept: 'y' }, 'layer-3')
    store.retainLayers(['layer-3'])

    expect(store.layerIds()).toEqual(['layer-3'])
    expect(store.getForLayer('layer-1')).toEqual({ shared: {}, named: {} })
    expect(store.getForLayer('layer-2')).toEqual({ shared: {}, named: {} })

    store.reset()

    expect(store.get()).toEqual({ shared: {}, named: {} })
    expect(store.getForLayer('layer-3')).toEqual({ shared: { kept: 'y' }, named: {} })
  })
})

describe('promoteDeepestLayer', () => {
  const stack = insertLayerBeneath(
    composeColdLayer(
      pageWith({ component: 'Users/Edit', url: '/users/5/edit', layer: { key: 'Users/Edit', base: '/users/5' } }),
      'layer-1',
    ),
    pageWith({
      component: 'Users/Show',
      props: { user: { id: 5 } },
      url: '/users/5?tab=profile',
      layer: { key: 'Users/Show', base: '/users' },
    }),
    'layer-2',
  )

  it('makes the deepest layer the page the rest of the stack stands on', () => {
    const page = promoteDeepestLayer(stack)

    expect(page.component).toBe('Users/Show')
    expect(page.props).toEqual({ user: { id: 5 } })
    expect(page.url).toBe('/users/5?tab=profile')
  })

  it('leaves the layers above it standing', () => {
    expect(promoteDeepestLayer(stack).layers).toEqual([expect.objectContaining({ id: 'layer-1', key: 'Users/Edit' })])
  })

  it('has no stack left when the layer it promotes is the only one', () => {
    const alone = composeColdLayer(
      pageWith({ component: 'Users/Edit', url: '/users/5/edit', layer: { key: 'Users/Edit', base: '/users' } }),
      'layer-1',
    )

    expect(promoteDeepestLayer(alone).component).toBe('Users/Edit')
    expect(promoteDeepestLayer(alone).layers).toBeUndefined()
  })

  it('carries the encryption the promoted layer asked for onto the page', () => {
    const secret = composeColdLayer(
      pageWith({
        component: 'Users/Edit',
        url: '/users/5/edit',
        layer: { key: 'Users/Edit', base: '/users' },
        encryptHistory: true,
      }),
      'layer-1',
    )

    expect(promoteDeepestLayer(secret).encryptHistory).toBe(true)
  })

  it('does not carry the flash of the base it discards onto the page', () => {
    expect(promoteDeepestLayer({ ...stack, flash: { message: 'Saved.' } }).flash).toEqual({})
  })

  it('leaves a page with no layers alone', () => {
    expect(promoteDeepestLayer(pageWith())).toEqual(pageWith())
  })

  it("carries the promoted layer's deferred, rescued, once and scroll props onto the page", () => {
    const pending = insertLayerBeneath(
      composeColdLayer(
        pageWith({ component: 'Users/Edit', url: '/users/5/edit', layer: { key: 'Users/Edit', base: '/users/5' } }),
        'layer-1',
      ),
      pageWith({
        component: 'Users/Show',
        url: '/users/5',
        layer: { key: 'Users/Show' },
        deferredProps: { default: ['activity'] },
        rescuedProps: ['permissions'],
        onceProps: { banner: { prop: 'banner' } },
        scrollProps: { notes: { pageName: 'page', previousPage: null, nextPage: 2, currentPage: 1, reset: false } },
      }),
      'layer-2',
    )

    const page = promoteDeepestLayer(pending)

    expect(page.deferredProps).toEqual({ default: ['activity'] })
    expect(page.initialDeferredProps).toEqual({ default: ['activity'] })
    expect(page.rescuedProps).toEqual(['permissions'])
    expect(page.onceProps).toEqual({ banner: { prop: 'banner' } })
    expect(page.scrollProps).toEqual({
      notes: { pageName: 'page', previousPage: null, nextPage: 2, currentPage: 1, reset: false },
    })
  })

  it("leaves the promoted layer's stack fields behind", () => {
    const page = promoteDeepestLayer(stack)

    expect(page).not.toHaveProperty('id')
    expect(page).not.toHaveProperty('key')
    expect(page).not.toHaveProperty('standalone')
    expect(page).not.toHaveProperty('entries')
    expect(page).not.toHaveProperty('owner')
  })
})

describe('openLayerFor', () => {
  const twoPanels = composeLayer(
    composeLayer(pageWith(), pageWith({ component: 'Panel', layer: {} }), 'layer-1', '/panels/1'),
    pageWith({ component: 'Panel', layer: {} }),
    'layer-2',
    { url: '/panels/2', standalone: true },
  )

  it("finds the layer open under the response's key", () => {
    expect(openLayerFor(twoPanels, pageWith({ component: 'Panel', layer: {} }))?.id).toBe('layer-1')
  })

  it('prefers the layer the visit was made from where two share a key', () => {
    expect(openLayerFor(twoPanels, pageWith({ component: 'Panel', layer: {} }), 'layer-2')?.id).toBe('layer-2')
  })

  it('never matches a local layer', () => {
    const local = composeLocalLayer(pageWith(), 'Panel', {}, 'layer-9', 'base-1')

    expect(openLayerFor(local, pageWith({ component: 'Panel', layer: {} }))).toBeUndefined()
  })

  it('finds nothing when no open layer carries the key', () => {
    expect(openLayerFor(twoPanels, pageWith({ component: 'Users/Edit', layer: {} }))).toBeUndefined()
  })
})

describe('addressOf', () => {
  it('is the page url when there are no layers', () => {
    expect(addressOf(pageWith())).toBe('/users')
  })

  it('is the topmost layer url', () => {
    const one = composeLayer(pageWith(), pageWith({ component: 'A', url: '/a', layer: { key: 'A' } }), 'layer-1')
    const two = composeLayer(one, pageWith({ component: 'B', url: '/b', layer: { key: 'B' } }), 'layer-2')

    expect(addressOf(two)).toBe('/b')
  })

  it('falls through a layer that has no url of its own', () => {
    const routed = composeLayer(pageWith(), pageWith({ component: 'A', url: '/a', layer: { key: 'A' } }), 'layer-1')
    const local = { ...routed, layers: [...routed.layers!, { ...routed.layers![0], id: 'layer-2', url: null }] }

    expect(addressOf(local)).toBe('/a')
  })

  it('is the topmost layer url even when it is empty', () => {
    const routed = composeLayer(pageWith(), pageWith({ component: 'A', url: '', layer: { key: 'A' } }), 'layer-1')

    expect(addressOf(routed)).toBe('')
  })

  it('is the page url when no layer has one', () => {
    const routed = composeLayer(pageWith(), pageWith({ component: 'A', url: '/a', layer: { key: 'A' } }), 'layer-1')
    const local = { ...routed, layers: [{ ...routed.layers![0], url: null }] }

    expect(addressOf(local)).toBe('/users')
  })
})

describe('withAddressHash', () => {
  const routed = composeLayer(pageWith(), pageWith({ component: 'A', url: '/a', layer: { key: 'A' } }), 'layer-1')

  it('writes the hash onto the page url when there are no layers', () => {
    expect(withAddressHash(pageWith(), '#comments').url).toBe('http://localhost/users#comments')
  })

  it('writes it onto the topmost layer that has a url', () => {
    const stacked = composeLayer(routed, pageWith({ component: 'B', url: '/b', layer: { key: 'B' } }), 'layer-2')

    expect(withAddressHash(stacked, '#comments').layers!.map((layer) => layer.url)).toEqual([
      '/a',
      'http://localhost/b#comments',
    ])
  })

  it('falls through a layer that has no url of its own', () => {
    const local = composeLayer(routed, pageWith({ component: 'B', url: '/b', layer: { key: 'B' } }), 'layer-2', {
      url: null,
    })

    expect(withAddressHash(local, '#comments').layers!.map((layer) => layer.url)).toEqual([
      'http://localhost/a#comments',
      null,
    ])
  })

  it('writes it onto the page url when no layer has one', () => {
    const local = { ...routed, layers: [{ ...routed.layers![0], url: null }] }
    const hashed = withAddressHash(local, '#comments')

    expect(hashed.url).toBe('http://localhost/users#comments')
    expect(hashed.layers![0].url).toBeNull()
  })

  it('replaces a hash the address already carries', () => {
    expect(withAddressHash(pageWith({ url: '/users#top' }), '#comments').url).toBe('http://localhost/users#comments')
  })

  it('does not mutate the page it is given', () => {
    withAddressHash(routed, '#comments')

    expect(routed.layers![0].url).toBe('/a')
  })
})

describe('encryptsHistory', () => {
  const stack = (base: Partial<Page>, ...layers: Partial<Page>[]): Page =>
    layers.reduce(
      (page, overrides, index) =>
        composeLayer(
          page,
          pageWith({ component: `L${index}`, layer: { key: `L${index}` }, ...overrides }),
          `layer-${index}`,
        ),
      pageWith(base),
    )

  it('is false for a page nobody asked to encrypt', () => {
    expect(encryptsHistory(pageWith())).toBe(false)
  })

  it('is true for a page that asks for it', () => {
    expect(encryptsHistory(pageWith({ encryptHistory: true }))).toBe(true)
  })

  it('is false when neither the base nor its layer asks for it', () => {
    expect(encryptsHistory(stack({}, {}))).toBe(false)
  })

  it('is true when only the layer asks for it', () => {
    expect(encryptsHistory(stack({}, { encryptHistory: true }))).toBe(true)
  })

  it('is true when only the base asks for it', () => {
    expect(encryptsHistory(stack({ encryptHistory: true }, {}))).toBe(true)
  })

  it('is true when any layer in the stack asks for it', () => {
    expect(encryptsHistory(stack({}, {}, { encryptHistory: true }, {}))).toBe(true)
  })

  const withoutAnswer = (page: Page): Page => {
    const { encryptHistory, ...older } = page.layers![0]

    return { ...page, layers: [older as LayerState] }
  }

  it('reads a layer with no encryptHistory of its own as not asking', () => {
    expect(encryptsHistory(withoutAnswer(stack({}, {})))).toBe(false)
  })

  it('still reads the base beneath a layer with no encryptHistory of its own', () => {
    expect(encryptsHistory(withoutAnswer(stack({ encryptHistory: true }, {})))).toBe(true)
  })
})

describe('capturedBaseIsValid', () => {
  const loginPage = pageWith({ component: 'Auth/Login', url: '/login' })
  const stackWith = (key: string, id = 'layer-1'): Page =>
    composeLayer(pageWith(), pageWith({ component: key, layer: { key: key } }), id)

  const validity = (overrides: Partial<Parameters<typeof capturedBaseIsValid>[0]> = {}): boolean =>
    capturedBaseIsValid({
      captured: { page: loginPage, generation: 7 },
      live: { page: loginPage, generation: 7 },
      dispatchedUrl: new URL('http://localhost/login'),
      layer: { url: '/users/5/edit', key: 'Users/Edit' },
      ...overrides,
    })

  it('holds when the visit was dispatched toward the layer', () => {
    expect(validity({ dispatchedUrl: new URL('http://localhost/users/5/edit') })).toBe(true)
  })

  it('holds when the layer is already open', () => {
    expect(validity({ live: { page: stackWith('Users/Edit'), generation: 7 } })).toBe(true)
  })

  it('holds when the layer it was dispatched from is still open', () => {
    const stack = stackWith('Teams/Show')

    expect(validity({ captured: { page: stack, generation: 7 }, live: { page: stack, generation: 7 } })).toBe(true)
  })

  it('fails once the layer it was dispatched from has been closed', () => {
    expect(validity({ captured: { page: stackWith('Teams/Show'), generation: 7 } })).toBe(false)
  })

  it('fails when the layer it was dispatched from has been closed and another opened', () => {
    expect(
      validity({
        captured: { page: stackWith('Teams/Show'), generation: 7 },
        live: { page: stackWith('Teams/Members', 'layer-2'), generation: 7 },
      }),
    ).toBe(false)
  })

  it('fails for a layer returned through a login page', () => {
    expect(validity()).toBe(false)
  })

  it('fails once the base it captured has been replaced, whatever else holds', () => {
    expect(
      validity({ dispatchedUrl: new URL('http://localhost/users/5/edit'), live: { page: loginPage, generation: 8 } }),
    ).toBe(false)
  })
})

describe('promoteLayer', () => {
  const response = pageWith({
    component: 'Users/Edit',
    url: '/users/5/edit',
    layer: { key: 'Users/Edit', base: '/users' },
  })

  it('drops the layer mark and the stack', () => {
    const promoted = promoteLayer(response)

    expect(promoted).not.toHaveProperty('layer')
    expect(promoted).not.toHaveProperty('layers')
  })

  it('keeps everything the page itself is made of', () => {
    expect(promoteLayer(response)).toEqual({ ...pageWith(), component: 'Users/Edit', url: '/users/5/edit' })
  })

  it('does not mutate the response', () => {
    const copy = structuredClone(response)

    promoteLayer(response)

    expect(response).toEqual(copy)
  })
})

describe('closeLayer', () => {
  const stack = (...urls: (string | null)[]): Page =>
    urls.reduce(
      (page, url, index) =>
        composeLayer(page, pageWith({ component: `L${index}`, layer: { key: `L${index}` } }), `layer-${index + 1}`, {
          url: url,
        }),
      pageWith(),
    )

  it('leaves the page the stack was drawn over', () => {
    const closed = closeLayer(stack('/a'), 'layer-1')

    expect(closed.component).toBe('Users/Index')
    expect(closed.url).toBe('/users')
    expect(closed).not.toHaveProperty('layers')
  })

  it('removes every layer above the one being closed', () => {
    const closed = closeLayer(stack('/a', '/b', '/c'), 'layer-2')

    expect(closed.layers!.map((layer) => layer.id)).toEqual(['layer-1'])
  })

  it('leaves the stack alone when the layer is not on it', () => {
    const closed = closeLayer(stack('/a', '/b'), 'layer-9')

    expect(closed.layers!.map((layer) => layer.id)).toEqual(['layer-1', 'layer-2'])
  })

  it('does not mutate the page', () => {
    const open = stack('/a', '/b')
    const copy = structuredClone(open)

    closeLayer(open, 'layer-1')

    expect(open).toEqual(copy)
  })
})

describe('history entry counting', () => {
  const openAt = (url: string) => composeLayer(pageWith(), pageWith({ component: 'A', url, layer: {} }), 'layer-1')

  it('counts the entry against the layer that owns the address', () => {
    const counted = recordHistoryEntry(openAt('/a'))

    expect(counted.layers![0].entries).toBe(1)
    expect(entriesToUnwind(counted, 'layer-1')).toBe(1)
  })

  it('gives the entry back when the browser refused to write it', () => {
    const counted = recordHistoryEntry(openAt('/a'))
    const dropped = dropHistoryEntry(counted)

    expect(dropped.layers![0].entries).toBe(0)
    expect(entriesToUnwind(dropped, 'layer-1')).toBe(0)
  })

  it('never counts a layer below zero entries', () => {
    expect(dropHistoryEntry(openAt('/a')).layers![0].entries).toBe(0)
  })

  it('does nothing on a page with no layers', () => {
    const page = pageWith()

    expect(dropHistoryEntry(page)).toEqual(page)
  })
})
