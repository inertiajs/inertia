import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { router } from '../src'
import { eventHandler } from '../src/eventHandler'
import { history } from '../src/history'
import { http } from '../src/http'
import { layerClosing } from '../src/layers'
import { createLayerHandle, registryClose, registryHas, registryRead, registryWrite } from '../src/layers'
import { addressOf, composeLayer } from '../src/layers'
import { page as currentPage } from '../src/page'
import { prefetchedRequests } from '../src/prefetched'
import { Router, createLayerApi } from '../src/router'
import { LayerState, Page, ResolvedLayer, VisitOptions } from '../src/types'
import { listeners, veto } from './support/browser'
import { editLayer, hold, holding, marked, pageWith, respondWith, settled } from './support/layers'

describe('router.layer: the routed handle', () => {
  const client = http.getClient()

  beforeEach(() => {
    prefetchedRequests.removeAll()
  })

  afterEach(() => {
    http.setClient(client)
    layerClosing.settleUnwind()
    vi.restoreAllMocks()
  })

  it('returns a handle that subscribes and closes', async () => {
    await hold(pageWith())
    respondWith(editLayer())

    const handle = router.layer('http://localhost/users/5/edit')
    await vi.waitFor(() => expect(currentPage.get().layers).toHaveLength(1))

    expect(typeof handle.on).toBe('function')
    expect(typeof handle.onClose).toBe('function')
    expect(typeof handle.close).toBe('function')
  })

  it('composes a warm layer under the id the handle was minted with, and close() dismisses it', async () => {
    await hold(pageWith())
    respondWith(editLayer())

    const handle = router.layer('http://localhost/users/5/edit')
    await vi.waitFor(() => expect(currentPage.get().layers).toHaveLength(1))

    const [layer] = currentPage.get().layers!
    expect(layer.id).toBe(handle.id)
    expect(registryRead(layer.id)).toBe(handle)

    const go = vi.spyOn(window.history, 'go')
    handle.close()
    await settled()
    layerClosing.closed(layer.id)
    await history.processQueue()

    expect(go).toHaveBeenCalledWith(-1)

    http.setClient({ request: () => new Promise(() => {}) })
    eventHandler.init()
    listeners.get('popstate')!({ state: { page: pageWith() } } as PopStateEvent)
    await vi.waitFor(() => expect(currentPage.get()).not.toHaveProperty('layers'))
  })

  it('composes a cold layer under the carried id when the captured base went stale', async () => {
    await hold(pageWith())
    const answer = holding()

    const handle = router.layer('http://localhost/users/5/edit')
    await vi.waitFor(() => expect(answer()).not.toBeNull())

    await currentPage.set(pageWith({ component: 'Users/Archive', url: '/users/archive' }))

    answer()!({
      status: 200,
      data: editLayer({ layer: { base: '/users' } }),
      headers: { 'x-inertia': 'true' },
    })

    await vi.waitFor(() => expect(currentPage.get().layers).toHaveLength(1))

    const [layer] = currentPage.get().layers!
    expect(layer.id).toBe(handle.id)
    expect(layer.standalone).toBe(true)
    expect(registryRead(layer.id)).toBe(handle)
  })

  it('re-keys the handle when the stack takes the id it was minted with, and close() still works', async () => {
    await hold(pageWith())
    const answer = holding()

    const handle = router.layer('http://localhost/users/5/edit')
    await vi.waitFor(() => expect(answer()).not.toBeNull())
    const minted = handle.id

    await currentPage.set(
      composeLayer(currentPage.get(), pageWith({ component: 'Teams/Show', layer: { key: 'Teams/Show' } }), minted),
      { preservesBase: true },
    )

    answer()!({ status: 200, data: editLayer(), headers: { 'x-inertia': 'true' } })

    await vi.waitFor(() => expect(currentPage.get().layers).toHaveLength(2))

    const [taken, composed] = currentPage.get().layers!
    expect(composed.id).not.toBe(minted)
    expect(composed.id).toBe(handle.id)
    expect(registryRead(composed.id)).toBe(handle)

    const go = vi.spyOn(window.history, 'go')
    handle.close()
    await settled()
    layerClosing.closed(composed.id)
    await history.processQueue()

    expect(go).toHaveBeenCalledWith(-1)

    eventHandler.init()
    listeners.get('popstate')!({ state: { page: { ...currentPage.get(), layers: [taken] } } } as PopStateEvent)
    await vi.waitFor(() => expect(currentPage.get().layers!.map((layer) => layer.id)).toEqual([taken.id]))
  })

  it('takes over the layer already open under the key, rather than opening another', async () => {
    await hold(composeLayer(pageWith(), editLayer(), 'layer-1'))
    const [open] = currentPage.get().layers!
    respondWith(editLayer({ props: { user: { id: 5, name: 'Renamed' } } }))

    const handle = router.layer('http://localhost/users/5/edit')
    await vi.waitFor(() => expect(currentPage.get().layers![0].props).toEqual({ user: { id: 5, name: 'Renamed' } }))

    expect(currentPage.get().layers!.map((layer) => layer.id)).toEqual([open.id])
    expect(handle.id).toBe(open.id)
    expect(registryRead(open.id)).toBe(handle)

    const go = vi.spyOn(window.history, 'go')
    handle.close()
    await settled()
    layerClosing.closed(open.id)
    await history.processQueue()

    expect(go).toHaveBeenCalledWith(-1)

    http.setClient({ request: () => new Promise(() => {}) })
    eventHandler.init()
    listeners.get('popstate')!({ state: { page: pageWith() } } as PopStateEvent)
    await vi.waitFor(() => expect(currentPage.get()).not.toHaveProperty('layers'))
  })

  it('keeps the first handle listening when a second open takes over the layer, and closes both', async () => {
    await hold(pageWith())
    respondWith(editLayer())

    const first = router.layer('http://localhost/users/5/edit')
    await vi.waitFor(() => expect(currentPage.get().layers).toHaveLength(1))

    const closed: string[] = []
    first.onClose(() => closed.push('first'))

    respondWith(editLayer({ props: { user: { id: 5, name: 'Renamed' } } }))

    const second = router.layer('http://localhost/users/5/edit')
    await vi.waitFor(() => expect(currentPage.get().layers![0].props).toEqual({ user: { id: 5, name: 'Renamed' } }))

    second.onClose(() => closed.push('second'))
    expect(second.id).toBe(first.id)

    respondWith(pageWith())

    const open = currentPage.get().layers![0]
    second.close()
    await settled()
    layerClosing.closed(open.id)
    await history.processQueue()

    eventHandler.init()
    listeners.get('popstate')!({ state: { page: pageWith() } } as PopStateEvent)

    await vi.waitFor(() => expect(closed).toEqual(['first', 'second']))
  })

  it('makes the page the owner of a layer opened from it', async () => {
    await hold(pageWith())
    respondWith(editLayer())
    const baseId = currentPage.id()

    router.layer('http://localhost/users/5/edit')
    await vi.waitFor(() => expect(currentPage.get().layers).toHaveLength(1))

    expect(currentPage.get().layers![0].owner).toBe(baseId)
  })

  it("keeps a layer's handle when a partial it made is answered by a page that keeps the stack", async () => {
    await hold(pageWith())
    respondWith(editLayer())
    const handle = router.layer('http://localhost/users/5/edit')
    await vi.waitFor(() => expect(currentPage.get().layers).toHaveLength(1))

    let fires = 0
    handle.onClose(() => fires++)

    respondWith(pageWith({ url: '/users?search=x', props: { users: [{ id: 9 }] } }))
    await new Promise<void>((resolve) => {
      new Router().visit('http://localhost/users?search=x', {
        layerId: handle.id,
        only: ['users'],
        onSuccess: () => resolve(),
        onError: () => resolve(),
      })
    })

    expect(currentPage.get().layers).toHaveLength(1)
    expect(fires).toBe(0)
    expect(registryHas(handle.id)).toBe(true)
  })

  it('keeps the layer a vetoed link was sent from, and closes the handle of a vetoed open', async () => {
    await hold(composeLayer(pageWith(), editLayer(), 'layer-1'))
    const [opener] = currentPage.get().layers!
    const openerHandle = router.layerHandle(opener.id)
    respondWith(pageWith({ component: 'Users/Notes', url: '/users/5/notes', layer: { key: 'Users/Notes' } }))
    veto.types.add('inertia:before')

    try {
      router.visit('http://localhost/users/5/notes', { layerId: opener.id })
      expect(registryRead(opener.id)).toBe(openerHandle)

      const handle = router.layer('http://localhost/users/5/notes')
      expect(registryHas(handle.id)).toBe(false)
    } finally {
      veto.types.delete('inertia:before')
    }
  })

  it('makes the layer a link was clicked in the owner of the layer it opens, keeping its handle', async () => {
    await hold(composeLayer(pageWith(), editLayer(), 'layer-1'))
    const [opener] = currentPage.get().layers!
    const openerHandle = router.layerHandle(opener.id)
    const heard: unknown[] = []
    openerHandle.on('saved', (payload) => heard.push(payload))
    respondWith(pageWith({ component: 'Users/Notes', url: '/users/5/notes', layer: { key: 'Users/Notes' } }))

    router.visit('http://localhost/users/5/notes', { layerId: opener.id })
    await vi.waitFor(() => expect(currentPage.get().layers).toHaveLength(2))

    const [, child] = currentPage.get().layers!
    expect(child.owner).toBe(opener.id)
    expect(openerHandle.id).toBe(opener.id)
    expect(registryRead(opener.id)).toBe(openerHandle)

    router.layerHandle(child.id).emit('saved', { id: 9 })
    expect(heard).toEqual([{ id: 9 }])
  })

  it('makes a layer the owner of a layer opened from inside it', async () => {
    await hold(composeLayer(pageWith(), editLayer(), 'layer-1'))
    const [opener] = currentPage.get().layers!
    respondWith(pageWith({ component: 'Users/Notes', url: '/users/5/notes', layer: { key: 'Users/Notes' } }))

    router.layer('http://localhost/users/5/notes')
    await vi.waitFor(() => expect(currentPage.get().layers).toHaveLength(2))

    expect(currentPage.get().layers![1].owner).toBe(opener.id)
  })
})

describe('layer events', () => {
  const layerAt = (path: string, component: string): Page =>
    pageWith({ component, url: path, layer: { key: component } })

  const responding = (pages: Record<string, Page>) =>
    http.setClient({
      request: async ({ url }) => ({
        status: 200,
        data: pages[new URL(url).pathname],
        headers: { 'x-inertia': 'true' },
      }),
    })

  const client = http.getClient()

  beforeEach(() => {
    prefetchedRequests.removeAll()
  })

  afterEach(() => {
    http.setClient(client)
    layerClosing.settleUnwind()
    vi.restoreAllMocks()
  })

  it('delivers an event to the immediate owner only, never up the chain', async () => {
    await hold(pageWith())
    responding({
      '/a': layerAt('/a', 'Users/A'),
      '/b': layerAt('/b', 'Users/B'),
      '/c': layerAt('/c', 'Users/C'),
    })

    const a = router.layer('http://localhost/a')
    await vi.waitFor(() => expect(currentPage.get().layers).toHaveLength(1))
    const b = router.layer('http://localhost/b')
    await vi.waitFor(() => expect(currentPage.get().layers).toHaveLength(2))
    const c = router.layer('http://localhost/c')
    await vi.waitFor(() => expect(currentPage.get().layers).toHaveLength(3))

    const seen: string[] = []
    a.on('saved', () => seen.push('a'))
    b.on('saved', () => seen.push('b'))

    c.emit('saved', { id: 3 })
    expect(seen).toEqual(['b'])

    b.emit('saved', { id: 2 })
    expect(seen).toEqual(['b', 'a'])
  })

  it('distinguishes the same-named events of two children by the emitting id', async () => {
    const base = pageWith()
    const a = composeLayer(base, pageWith({ component: 'Users/A', url: '/a', layer: { key: 'Users/A' } }), 'layer-a')
    const withB = composeLayer(a, pageWith({ component: 'Users/B', url: '/b', layer: { key: 'Users/B' } }), 'layer-b', {
      url: '/b',
      owner: 'layer-a',
    })
    const withD = composeLayer(
      withB,
      pageWith({ component: 'Users/D', url: '/d', layer: { key: 'Users/D' } }),
      'layer-d',
      { url: '/d', owner: 'layer-a' },
    )

    currentPage.init({
      initialPage: withD,
      resolveComponent: (name) => ({ name }) as never,
      swapComponent: async () => {},
    })

    const ownerOf = (layerId: string): string | null | undefined =>
      (currentPage.get().layers ?? []).find((layer) => layer.id === layerId)?.owner
    const aHandle = createLayerHandle('layer-a', async () => {}, ownerOf)
    const bHandle = createLayerHandle('layer-b', async () => {}, ownerOf)
    const dHandle = createLayerHandle('layer-d', async () => {}, ownerOf)
    registryWrite('layer-a', aHandle)
    registryWrite('layer-b', bHandle)
    registryWrite('layer-d', dHandle)

    const seen: [string, unknown][] = []
    aHandle.on('saved', (payload, childId) => seen.push([childId, payload]))

    bHandle.emit('saved', { id: 1 })
    dHandle.emit('saved', { id: 2 })

    expect(seen).toEqual([
      ['layer-b', { id: 1 }],
      ['layer-d', { id: 2 }],
    ])
  })

  it('drops an event no one subscribed to, silently', async () => {
    await hold(pageWith())
    responding({ '/a': layerAt('/a', 'Users/A'), '/b': layerAt('/b', 'Users/B') })

    const a = router.layer('http://localhost/a')
    await vi.waitFor(() => expect(currentPage.get().layers).toHaveLength(1))
    const b = router.layer('http://localhost/b')
    await vi.waitFor(() => expect(currentPage.get().layers).toHaveLength(2))

    expect(() => b.emit('saved', { id: 1 })).not.toThrow()
  })

  it('drops an event a layer emits to the page, which has no handle to hear it', async () => {
    await hold(pageWith())
    responding({ '/a': layerAt('/a', 'Users/A') })

    const a = router.layer('http://localhost/a')
    await vi.waitFor(() => expect(currentPage.get().layers).toHaveLength(1))

    expect(currentPage.get().layers![0].owner).toBe(currentPage.id())
    expect(() => a.emit('saved', { id: 1 })).not.toThrow()
  })

  it('closes a child opened through layer.layer(), leaving the layer that opened it', async () => {
    await hold(pageWith())
    responding({ '/a': layerAt('/a', 'Users/A'), '/b': layerAt('/b', 'Users/B') })

    const a = router.layer('http://localhost/a')
    await vi.waitFor(() => expect(currentPage.get().layers).toHaveLength(1))

    const child = createLayerApi(a.id).layer('http://localhost/b')
    await vi.waitFor(() => expect(currentPage.get().layers).toHaveLength(2))

    await child.close()
    await settled()

    expect(currentPage.get().layers!.map((layer) => layer.id)).toEqual([a.id])
  })

  it('hears a layer event through once() exactly once, and through on() every time', async () => {
    await hold(pageWith())
    responding({ '/a': layerAt('/a', 'Users/A') })

    const heard: string[] = []
    const owner = createLayerApi(undefined)

    owner.once('saved', () => heard.push('once'))
    owner.on('saved', () => heard.push('on'))

    const a = router.layer('http://localhost/a')
    await vi.waitFor(() => expect(currentPage.get().layers).toHaveLength(1))

    a.emit('saved')
    a.emit('saved')

    expect(heard).toEqual(['once', 'on', 'on'])
  })

  it('stops a once() subscription that never fired', async () => {
    await hold(pageWith())
    responding({ '/a': layerAt('/a', 'Users/A') })

    const heard: string[] = []
    const stop = createLayerApi(undefined).once('saved', () => heard.push('once'))

    const a = router.layer('http://localhost/a')
    await vi.waitFor(() => expect(currentPage.get().layers).toHaveLength(1))

    stop()
    a.emit('saved')

    expect(heard).toEqual([])
  })

  it('keeps the page hearing its children across a preserved visit of its own component', async () => {
    await hold(pageWith())
    responding({ '/a': layerAt('/a', 'Users/A') })

    const heard: unknown[] = []
    createLayerApi(undefined).on('saved', (payload) => heard.push(payload))

    await currentPage.set(pageWith({ url: '/users?filter=x' }), { preserveState: true })

    const a = router.layer('http://localhost/a')
    await vi.waitFor(() => expect(currentPage.get().layers).toHaveLength(1))

    a.emit('saved', { id: 1 })

    expect(heard).toEqual([{ id: 1 }])
  })
})

describe('closing a layer that has a handle', () => {
  const client = http.getClient()

  beforeEach(() => {
    prefetchedRequests.removeAll()
  })

  afterEach(() => {
    http.setClient(client)
    layerClosing.settleUnwind()
    vi.restoreAllMocks()
  })

  it('fires onClose once the removal and the refresh it triggered have settled, seeing the refreshed state', async () => {
    await hold(pageWith())
    let answer: ((response: unknown) => void) | null = null
    http.setClient({ request: () => new Promise((resolve) => (answer = resolve)) })

    const handle = router.layer('http://localhost/users/5/edit')
    await vi.waitFor(() => expect(answer).not.toBeNull())
    answer!({ status: 200, data: editLayer(), headers: { 'x-inertia': 'true' } })
    await vi.waitFor(() => expect(currentPage.get().layers).toHaveLength(1))

    const seen: Page[] = []
    handle.onClose(() => seen.push(currentPage.get()))

    http.setClient({
      request: async () => ({
        status: 200,
        data: pageWith({ props: { users: [{ id: 9 }] } }),
        headers: { 'x-inertia': 'true' },
      }),
    })

    handle.close()
    await settled()
    router.closed(handle.id)
    await history.processQueue()

    eventHandler.init()
    listeners.get('popstate')!({ state: { page: pageWith() } } as PopStateEvent)

    await vi.waitFor(() => expect(seen).toHaveLength(1))
    expect(seen[0].props).toEqual(expect.objectContaining({ users: [{ id: 9 }] }))
    expect(registryHas(handle.id)).toBe(false)
  })

  it('refreshes the layer beneath once, after the unwind settled, targeting the restored address', async () => {
    await hold(pageWith())
    const requested: string[] = []
    let answer: ((response: unknown) => void) | null = null
    http.setClient({
      request: ({ url }) => {
        requested.push(new URL(url).pathname)

        return new Promise((resolve) => (answer = resolve))
      },
    })

    const handle = router.layer('http://localhost/users/5/edit')
    await vi.waitFor(() => expect(answer).not.toBeNull())
    answer!({ status: 200, data: editLayer(), headers: { 'x-inertia': 'true' } })
    await vi.waitFor(() => expect(currentPage.get().layers).toHaveLength(1))

    handle.close()
    await settled()
    router.closed(handle.id)
    await history.processQueue()

    expect(requested).toEqual(['/users/5/edit'])

    eventHandler.init()
    listeners.get('popstate')!({ state: { page: pageWith() } } as PopStateEvent)

    await vi.waitFor(() => expect(requested).toEqual(['/users/5/edit', '/users']))
    answer!({ status: 200, data: pageWith(), headers: { 'x-inertia': 'true' } })
    await vi.waitFor(() => expect(registryHas(handle.id)).toBe(false))
  })

  it('aims the refresh at the base when the layer it lands on has no url of its own', async () => {
    await hold(pageWith({ props: { token: 'base value' }, onceProps: { baseKey: { prop: 'token' } } }))
    const sent: { url: string; onceProps: string | undefined }[] = []
    let answer: ((response: unknown) => void) | null = null
    http.setClient({
      request: ({ url, headers }) => {
        sent.push({ url: new URL(url).pathname, onceProps: (headers ?? {})['X-Inertia-Except-Once-Props'] })

        return new Promise((resolve) => (answer = resolve))
      },
    })

    router.layer({ component: 'Layers/Local', props: {} })
    await vi.waitFor(() => expect(currentPage.get().layers).toHaveLength(1))
    const beneath = currentPage.get()

    const handle = router.layer('http://localhost/users/5/edit')
    await vi.waitFor(() => expect(answer).not.toBeNull())
    answer!({ status: 200, data: editLayer(), headers: { 'x-inertia': 'true' } })
    await vi.waitFor(() => expect(currentPage.get().layers).toHaveLength(2))

    handle.close()
    await settled()
    router.closed(handle.id)
    await history.processQueue()

    eventHandler.init()
    listeners.get('popstate')!({ state: { page: beneath } } as PopStateEvent)

    await vi.waitFor(() => expect(sent.map((request) => request.url)).toEqual(['/users/5/edit', '/users']))
    expect(sent[1].onceProps).toBe('baseKey')
  })

  it('completes the close itself when the browser never answers the step back', async () => {
    await hold(pageWith())
    const requested: string[] = []
    let answer: ((response: unknown) => void) | null = null
    http.setClient({
      request: ({ url }) => {
        requested.push(new URL(url).pathname)

        return new Promise((resolve) => (answer = resolve))
      },
    })

    const handle = router.layer('http://localhost/users/5/edit')
    await vi.waitFor(() => expect(answer).not.toBeNull())
    answer!({ status: 200, data: editLayer(), headers: { 'x-inertia': 'true' } })
    await vi.waitFor(() => expect(currentPage.get().layers).toHaveLength(1))

    handle.close()
    await settled()
    router.closed(handle.id)
    await history.processQueue()

    await vi.waitFor(() => expect(currentPage.get().layers ?? []).toHaveLength(0), { timeout: 4000 })
    await vi.waitFor(() => expect(requested).toEqual(['/users/5/edit', '/users']), { timeout: 4000 })
    answer!({ status: 200, data: pageWith(), headers: { 'x-inertia': 'true' } })
    await vi.waitFor(() => expect(registryHas(handle.id)).toBe(false))
  })

  it('fires onClose when a before listener vetoes the refresh the close runs', async () => {
    await hold(pageWith())
    let answer: ((response: unknown) => void) | null = null
    http.setClient({ request: () => new Promise((resolve) => (answer = resolve)) })

    const handle = router.layer('http://localhost/users/5/edit')
    await vi.waitFor(() => expect(answer).not.toBeNull())
    answer!({ status: 200, data: editLayer(), headers: { 'x-inertia': 'true' } })
    await vi.waitFor(() => expect(currentPage.get().layers).toHaveLength(1))

    let closed = false
    handle.onClose(() => (closed = true))

    veto.types.add('inertia:before')

    try {
      handle.close()
      await settled()
      router.closed(handle.id)
      await history.processQueue()

      eventHandler.init()
      listeners.get('popstate')!({ state: { page: pageWith() } } as PopStateEvent)

      await vi.waitFor(() => expect(closed).toBe(true))
      expect(registryHas(handle.id)).toBe(false)
    } finally {
      veto.types.delete('inertia:before')
    }
  })

  it('carries preserveState on the refresh, for the state of the layer beneath', async () => {
    let answer: ((response: unknown) => void) | null = null
    http.setClient({ request: () => new Promise((resolve) => (answer = resolve)) })

    currentPage.init({
      initialPage: pageWith(),
      resolveComponent: (name) => ({ name }) as never,
      swapComponent: async () => {},
    })
    await currentPage.setQuietly(pageWith())

    const handle = router.layer('http://localhost/users/5/edit')
    await vi.waitFor(() => expect(answer).not.toBeNull())
    answer!({ status: 200, data: editLayer(), headers: { 'x-inertia': 'true' } })
    await vi.waitFor(() => expect(currentPage.get().layers).toHaveLength(1))

    http.setClient({
      request: async () => ({ status: 200, data: pageWith(), headers: { 'x-inertia': 'true' } }),
    })
    const visit = vi.spyOn(router as unknown as { dispatchVisit: (...args: unknown[]) => boolean }, 'dispatchVisit')

    handle.close()
    await settled()
    router.closed(handle.id)
    await history.processQueue()

    eventHandler.init()
    listeners.get('popstate')!({ state: { page: pageWith() } } as PopStateEvent)

    await vi.waitFor(() => expect(visit.mock.calls.length).toBeGreaterThan(0))
    expect(visit.mock.calls.at(-1)).toEqual([
      '/users',
      expect.objectContaining({ reload: true, preserveState: true, replace: true }),
    ])
  })

  it('does not refresh when a restore drops the layer, since the restored entry already holds the base', async () => {
    await hold(pageWith())
    const requested: string[] = []
    http.setClient({
      request: async ({ url }) => {
        requested.push(new URL(url).pathname)

        return { status: 200, data: editLayer(), headers: { 'x-inertia': 'true' } }
      },
    })

    const handle = router.layer('http://localhost/users/5/edit')
    await vi.waitFor(() => expect(currentPage.get().layers).toHaveLength(1))
    requested.length = 0

    const seen: Page[] = []
    handle.onClose(() => seen.push(currentPage.get()))

    await currentPage.setQuietly(pageWith())

    expect(seen).toHaveLength(1)
    expect(requested).toEqual([])
    expect(registryHas(handle.id)).toBe(false)
  })

  it('does not refresh when the layer closed was standalone, since the blank recovery already fetches', async () => {
    const requested: string[] = []
    http.setClient({
      request: async ({ url }) => {
        requested.push(new URL(url).pathname)

        return { status: 200, data: editLayer(), headers: { 'x-inertia': 'true' } }
      },
    })

    currentPage.init({
      initialPage: {
        ...pageWith(),
        layers: [
          {
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
          },
        ],
      },
      resolveComponent: (name) => ({ name }) as never,
      swapComponent: async () => {},
    })
    const handle = createLayerHandle(
      'layer-1',
      async () => {},
      () => null,
    )
    let fires = 0
    handle.onClose(() => fires++)
    registryWrite('layer-1', handle)
    requested.length = 0

    const router = new Router()
    router.close('layer-1')
    await settled()
    router.closed('layer-1')
    await history.processQueue()

    expect(requested).toEqual([])
    await vi.waitFor(() => expect(fires).toBe(1))
    expect(registryHas('layer-1')).toBe(false)
  })
})

describe('layer handles across restores and navigations', () => {
  const client = http.getClient()

  beforeEach(() => {
    prefetchedRequests.removeAll()
  })

  afterEach(() => {
    http.setClient(client)
    layerClosing.settleUnwind()
    vi.restoreAllMocks()
  })

  it('fires a handle onClose exactly once when the restore drops its layer, then clears it', async () => {
    await hold(pageWith())
    http.setClient({
      request: async () => ({ status: 200, data: editLayer(), headers: { 'x-inertia': 'true' } }),
    })

    const handle = router.layer('http://localhost/users/5/edit')
    await vi.waitFor(() => expect(currentPage.get().layers).toHaveLength(1))

    let fires = 0
    handle.onClose(() => fires++)

    await currentPage.setQuietly(pageWith({ component: 'Users/Archive', url: '/users/archive' }))

    expect(fires).toBe(1)
    expect(registryHas(handle.id)).toBe(false)
  })

  it('gives a restored stack the page it lands on as its owner, so its events are still heard', async () => {
    await hold(pageWith())
    http.setClient({
      request: async () => ({ status: 200, data: editLayer(), headers: { 'x-inertia': 'true' } }),
    })

    const handle = router.layer('http://localhost/users/5/edit')
    await vi.waitFor(() => expect(currentPage.get().layers).toHaveLength(1))

    const stack = currentPage.get()

    await currentPage.set(pageWith({ component: 'Users/Archive', url: '/users/archive' }))
    await currentPage.setQuietly(stack)

    const heard: unknown[] = []
    router.layerHandle().on('saved', (payload) => heard.push(payload))
    router.layerHandle(handle.id).emit('saved', { id: 5 })

    expect(heard).toEqual([{ id: 5 }])
  })

  it('keeps the layer and page handles when a newer write supersedes an older one', async () => {
    await hold(composeLayer(pageWith(), editLayer(), 'layer-1'))

    const layer = router.layerHandle('layer-1')
    const base = router.layerHandle()
    let closed = ''

    layer.onClose(() => (closed += 'layer'))
    base.onClose(() => (closed += 'base'))

    currentPage.set(pageWith({ component: 'Teams/Index', url: '/teams' }))
    await new Promise<void>((resolve) => {
      new Router().replace({ props: { users: [{ id: 1 }] }, onSuccess: () => resolve() })
    })
    await settled()

    expect(currentPage.get().layers).toHaveLength(1)
    expect(closed).toBe('')
    expect(registryRead('layer-1')).toBe(layer)
    expect(router.layerHandle()).toBe(base)
  })

  it('keeps a handle whose layer the restored stack still holds', async () => {
    await hold(pageWith())
    http.setClient({
      request: async () => ({ status: 200, data: editLayer(), headers: { 'x-inertia': 'true' } }),
    })

    const outer = router.layer('http://localhost/users/5/edit')
    await vi.waitFor(() => expect(currentPage.get().layers).toHaveLength(1))

    const heard: string[] = []
    outer.onClose(() => heard.push('closed'))
    outer.on('saved', () => heard.push('saved'))

    http.setClient({
      request: async () => ({
        status: 200,
        data: pageWith({ component: 'Users/Notes', url: '/users/5/notes', layer: { key: 'Users/Notes' } }),
        headers: { 'x-inertia': 'true' },
      }),
    })

    router.layer('http://localhost/users/5/notes')
    await vi.waitFor(() => expect(currentPage.get().layers).toHaveLength(2))

    const [beneath] = currentPage.get().layers!
    await currentPage.setQuietly({ ...currentPage.get(), layers: [beneath] })

    expect(heard).toEqual([])
    expect(registryRead(outer.id)).toBe(outer)

    const reopened = router.layer('http://localhost/users/5/notes')
    await vi.waitFor(() => expect(currentPage.get().layers).toHaveLength(2))

    reopened.emit('saved')

    expect(heard).toEqual(['saved'])
  })

  it('fires a handle onClose when a navigation from the base takes its layer away', async () => {
    await hold(pageWith())
    http.setClient({
      request: async () => ({ status: 200, data: editLayer(), headers: { 'x-inertia': 'true' } }),
    })

    const handle = router.layer('http://localhost/users/5/edit')
    await vi.waitFor(() => expect(currentPage.get().layers).toHaveLength(1))

    let fires = 0
    handle.onClose(() => fires++)

    http.setClient({
      request: async () => ({
        status: 200,
        data: pageWith({ component: 'Teams/Index', url: '/teams' }),
        headers: { 'x-inertia': 'true' },
      }),
    })
    await new Promise<void>((resolve) => {
      new Router().visit('http://localhost/teams', { onSuccess: () => resolve(), onError: () => resolve() })
    })

    expect(currentPage.get().layers).toBeUndefined()
    expect(fires).toBe(1)
    expect(registryHas(handle.id)).toBe(false)
  })

  it('keeps the handle of a layer whose own response clears the history', async () => {
    await hold(pageWith())
    http.setClient({
      request: async () => ({
        status: 200,
        data: editLayer({ clearHistory: true }),
        headers: { 'x-inertia': 'true' },
      }),
    })

    const handle = router.layer('http://localhost/users/5/edit')
    let fires = 0
    handle.onClose(() => fires++)

    await vi.waitFor(() => expect(currentPage.get().layers).toHaveLength(1))

    expect(currentPage.get().layers![0].id).toBe(handle.id)
    expect(fires).toBe(0)
    expect(registryHas(handle.id)).toBe(true)
  })
})

describe('the handle of a layer open that never lands', () => {
  const client = http.getClient()

  beforeEach(() => {
    prefetchedRequests.removeAll()
  })

  afterEach(() => {
    http.setClient(client)
    layerClosing.settleUnwind()
    vi.restoreAllMocks()
  })

  it('closes the handle when a 4xx is suppressed by onHttpException', async () => {
    await hold(pageWith())
    const answer = holding()

    const handle = router.layer('http://localhost/users/5/edit', { onHttpException: () => false })
    await vi.waitFor(() => expect(answer()).not.toBeNull())

    let fires = 0
    handle.onClose(() => fires++)

    answer()!({ status: 422, data: editLayer(), headers: { 'x-inertia': 'true' } })

    await vi.waitFor(() => expect(fires).toBe(1))
    expect(registryHas(handle.id)).toBe(false)
  })

  it('closes the handle when the request is cancelled, and not twice if the response lands anyway', async () => {
    await hold(pageWith())
    const answer = holding()

    const openHandle = router.layer('http://localhost/users/5/notes')
    await vi.waitFor(() => expect(answer()).not.toBeNull())
    answer()!({
      status: 200,
      data: pageWith({ component: 'Users/Notes', url: '/users/5/notes', layer: { key: 'Users/Notes' } }),
      headers: { 'x-inertia': 'true' },
    })
    await vi.waitFor(() => expect(currentPage.get().layers).toHaveLength(1))

    let openFires = 0
    openHandle.onClose(() => openFires++)

    const handle = router.layer('http://localhost/users/5/edit')
    await vi.waitFor(() => expect(answer()).not.toBeNull())

    let fires = 0
    handle.onClose(() => fires++)

    router.cancelAll()
    await vi.waitFor(() => expect(fires).toBe(1))
    expect(registryHas(handle.id)).toBe(false)
    expect(openFires).toBe(0)

    answer()!({ status: 200, data: editLayer(), headers: { 'x-inertia': 'true' } })
    await new Promise((resolve) => setTimeout(resolve))

    expect(fires).toBe(1)
    expect(openFires).toBe(0)
  })

  it('does not fire a handle whose layer composed before a late cancel arrives', async () => {
    await hold(pageWith())
    const answer = holding()

    let release!: () => void
    const handle = router.layer('http://localhost/users/5/edit', {
      onSuccess: () => new Promise<void>((resolve) => (release = resolve)),
    })
    await vi.waitFor(() => expect(answer()).not.toBeNull())

    let fires = 0
    handle.onClose(() => fires++)

    answer()!({ status: 200, data: editLayer(), headers: { 'x-inertia': 'true' } })
    await vi.waitFor(() => expect(currentPage.get().layers).toHaveLength(1))

    router.cancelAll()
    release()

    expect(fires).toBe(0)
    expect(registryHas(handle.id)).toBe(true)
  })

  it('closes the handle whose layer a back restore drops, exactly once', async () => {
    await hold(pageWith())
    http.setClient({
      request: async () => ({ status: 200, data: editLayer(), headers: { 'x-inertia': 'true' } }),
    })

    const handle = router.layer('http://localhost/users/5/edit')
    await vi.waitFor(() => expect(currentPage.get().layers).toHaveLength(1))

    let fires = 0
    handle.onClose(() => fires++)

    await currentPage.setQuietly(pageWith())

    expect(fires).toBe(1)
    expect(registryHas(handle.id)).toBe(false)
  })

  it('closes the handle when onBefore vetoes the visit, leaving other handles alone', async () => {
    await hold(pageWith())
    http.setClient({
      request: async ({ url }) => {
        const path = new URL(url).pathname

        return {
          status: 200,
          data: pageWith({ component: path.slice(1), url: path, layer: { key: path.slice(1) } }),
          headers: { 'x-inertia': 'true' },
        }
      },
    })

    const openHandle = router.layer('http://localhost/notes')
    await vi.waitFor(() => expect(currentPage.get().layers).toHaveLength(1))

    let openFires = 0
    openHandle.onClose(() => openFires++)

    const handle = router.layer('http://localhost/users/5/edit', { onBefore: () => false })

    expect(registryHas(handle.id)).toBe(false)
    expect(registryHas(openHandle.id)).toBe(true)
    expect(openFires).toBe(0)
  })

  it('closes the handle when the layer response is promoted to a page instead of composing', async () => {
    await hold(pageWith())

    await currentPage.set(
      composeLayer(
        currentPage.get(),
        pageWith({ component: 'Users/Notes', url: '/users/5/notes', layer: { key: 'Users/Notes' } }),
        'layer-notes',
      ),
      { preservesBase: true },
    )
    const openHandle = createLayerHandle(
      'layer-notes',
      async () => {},
      () => null,
    )
    registryWrite('layer-notes', openHandle)

    let openFires = 0
    openHandle.onClose(() => openFires++)

    const answer = holding()
    const handle = router.layer('http://localhost/users/5/edit')
    await vi.waitFor(() => expect(answer()).not.toBeNull())

    let fires = 0
    handle.onClose(() => fires++)

    await currentPage.set(pageWith({ component: 'Users/Archive', url: '/users/archive' }))

    expect(openFires).toBe(1)

    answer()!({ status: 200, data: editLayer(), headers: { 'x-inertia': 'true' } })

    await vi.waitFor(() => expect(fires).toBe(1))
    expect(registryHas(handle.id)).toBe(false)
    expect(currentPage.get().component).toBe('Users/Edit')
    expect(openFires).toBe(1)
  })

  it('closes the handle when an async visit response is dropped', async () => {
    await hold(pageWith())
    const answer = holding()

    const handle = router.layer('http://localhost/users/5/edit', { async: true })
    await vi.waitFor(() => expect(answer()).not.toBeNull())

    let fires = 0
    handle.onClose(() => fires++)

    await currentPage.set(pageWith({ component: 'Users/Archive', url: '/users/archive' }))

    answer()!({ status: 200, data: pageWith({ props: { users: [{ id: 9 }] } }), headers: { 'x-inertia': 'true' } })

    await vi.waitFor(() => expect(fires).toBe(1))
    expect(registryHas(handle.id)).toBe(false)
  })

  it('fires the handle of a layer opened cold exactly once when a back restore drops its stack, even if its walk then fails', async () => {
    await hold(pageWith({ component: 'Auth/Login', url: '/login' }))
    const requested: string[] = []
    let answer: ((response: unknown) => void) | null = null
    http.setClient({
      request: ({ url }) => {
        requested.push(new URL(url).pathname)

        return new Promise((resolve) => (answer = resolve))
      },
    })

    const handle = router.layer('http://localhost/users/5/edit')
    await vi.waitFor(() => expect(answer).not.toBeNull())

    await currentPage.set(pageWith({ component: 'Users/Archive', url: '/users/archive' }))
    answer!({ status: 200, data: editLayer({ layer: { base: '/users' } }), headers: { 'x-inertia': 'true' } })
    await vi.waitFor(() => expect(currentPage.get().layers).toHaveLength(1))
    await vi.waitFor(() => expect(requested).toEqual(['/users/5/edit', '/users']))

    let fires = 0
    handle.onClose(() => fires++)

    eventHandler.init()
    listeners.get('popstate')!({ state: { page: pageWith() } } as PopStateEvent)
    await vi.waitFor(() => expect(fires).toBe(1))
    expect(registryHas(handle.id)).toBe(false)

    answer!({ status: 500, data: '<html>Server Error</html>', headers: {} })
    await new Promise((resolve) => setTimeout(resolve))

    expect(fires).toBe(1)
  })

  it('closes the handle when the application vetoes the visit before it starts', async () => {
    await hold(pageWith())
    holding()
    veto.types.add('inertia:before')

    let fires = 0
    const handle = router.layer('http://localhost/users/5/edit')
    handle.onClose(() => fires++)
    veto.types.clear()

    await settled()

    expect(fires).toBe(1)
    expect(registryHas(handle.id)).toBe(false)
    expect(currentPage.get().layers).toBeUndefined()
  })

  it('closes the handle when a 409 redirect re-issues the visit as a page navigation', async () => {
    await hold(pageWith())
    const requested: string[] = []

    http.setClient({
      request: async ({ url }) => {
        requested.push(new URL(url).pathname)

        return requested.length === 1
          ? { status: 409, data: '', headers: { 'x-inertia-redirect': 'http://localhost/users' } }
          : { status: 200, data: pageWith({ props: { users: [{ id: 9 }] } }), headers: { 'x-inertia': 'true' } }
      },
    })

    const handle = router.layer('http://localhost/users/5/edit', { async: true })

    let fires = 0
    handle.onClose(() => fires++)

    await vi.waitFor(() => expect(fires).toBe(1))
    await vi.waitFor(() => expect(requested).toEqual(['/users/5/edit', '/users']))

    expect(registryHas(handle.id)).toBe(false)
    expect(currentPage.get().layers).toBeUndefined()
  })

  it('closes the handle when the request never brings a response back', async () => {
    await hold(pageWith())
    http.setClient({
      request: async () => {
        throw new Error('offline')
      },
    })
    veto.types.add('inertia:networkError')

    let fires = 0
    const handle = router.layer('http://localhost/users/5/edit')
    handle.onClose(() => fires++)

    await vi.waitFor(() => expect(fires).toBe(1))
    veto.types.clear()

    expect(registryHas(handle.id)).toBe(false)
    expect(currentPage.get().layers).toBeUndefined()
  })

  it('closes the handle when a 4xx reaches the error dialog', async () => {
    await hold(pageWith())
    const answer = holding()

    const handle = router.layer('http://localhost/users/5/edit')
    await vi.waitFor(() => expect(answer()).not.toBeNull())

    let fires = 0
    handle.onClose(() => fires++)

    answer()!({ status: 500, data: '<html>Server Error</html>', headers: {} })

    await vi.waitFor(() => expect(fires).toBe(1))
    expect(registryHas(handle.id)).toBe(false)
  })
})

describe('a layer open answered by an interstitial', () => {
  const client = http.getClient()

  const prompt = (overrides: Partial<Page> = {}): Page =>
    pageWith({ component: 'Auth/Sudo', url: '/sudo', interstitial: true, ...overrides } as Partial<Page>)

  const answering = (...responses: Page[]) => {
    const queue = [...responses]

    http.setClient({
      request: async () => ({
        status: 200,
        data: (queue.length > 1 ? queue.shift() : queue[0]) as never,
        headers: { 'x-inertia': 'true' },
      }),
    })
  }

  const settled = () => new Promise((resolve) => setTimeout(resolve))

  beforeEach(() => {
    prefetchedRequests.removeAll()
  })

  afterEach(async () => {
    http.setClient(client)
    layerClosing.settleUnwind()
    await settled()
    vi.restoreAllMocks()
  })

  it('keeps the handle open, since the prompt returns to it', async () => {
    await hold(pageWith())
    answering(prompt())

    let fires = 0
    const handle = router.layer('http://localhost/users/5/edit')
    handle.onClose(() => fires++)
    await settled()

    expect(currentPage.get().component).toBe('Auth/Sudo')
    expect(fires).toBe(0)
    expect(registryHas(handle.id)).toBe(true)
  })

  it('fires onClose when the layer the prompt returned to is closed', async () => {
    await hold(pageWith())
    answering(prompt(), editLayer())

    let fires = 0
    const handle = router.layer('http://localhost/users/5/edit')
    handle.onClose(() => fires++)
    await settled()

    new Router().visit('http://localhost/users/5/edit')
    await vi.waitFor(() => expect(currentPage.get().layers).toHaveLength(1))
    expect(currentPage.get().layers![0].id).toBe(handle.id)
    expect(fires).toBe(0)

    await router.close(handle.id)
    await settled()

    expect(fires).toBe(1)
  })

  it('keeps the handle open when the prompt answers its own submit', async () => {
    await hold(pageWith())
    answering(prompt(), prompt({ props: { errors: { password: 'Wrong' } } }), editLayer())

    let fires = 0
    const handle = router.layer('http://localhost/users/5/edit')
    handle.onClose(() => fires++)
    await settled()

    new Router().visit('http://localhost/sudo', { method: 'post' })
    await settled()

    expect(fires).toBe(0)
    expect(registryHas(handle.id)).toBe(true)

    new Router().visit('http://localhost/users/5/edit')
    await vi.waitFor(() => expect(currentPage.get().layers).toHaveLength(1))

    expect(currentPage.get().component).toBe('Users/Index')
    expect(currentPage.get().layers![0].id).toBe(handle.id)
  })

  it('fires onClose when a navigation away abandons the prompt', async () => {
    await hold(pageWith())
    answering(prompt(), pageWith({ component: 'Dashboard', url: '/dashboard' }))

    let fires = 0
    const handle = router.layer('http://localhost/users/5/edit')
    handle.onClose(() => fires++)
    await settled()

    new Router().visit('http://localhost/dashboard')
    await vi.waitFor(() => expect(fires).toBe(1))

    expect(currentPage.get().component).toBe('Dashboard')
    expect(registryHas(handle.id)).toBe(false)
  })

  it('closes the handle when the response is an ordinary page rather than a prompt', async () => {
    await hold(pageWith())
    answering(pageWith({ component: 'Auth/Login', url: '/login' }))

    let fires = 0
    const handle = router.layer('http://localhost/users/5/edit')
    handle.onClose(() => fires++)

    await vi.waitFor(() => expect(fires).toBe(1))
    expect(registryHas(handle.id)).toBe(false)
  })

  it('gives the returned layer the page it lands on as its owner', async () => {
    await hold(pageWith())
    answering(prompt(), editLayer())

    const handle = router.layer('http://localhost/users/5/edit')
    await settled()

    new Router().visit('http://localhost/users/5/edit')
    await vi.waitFor(() => expect(currentPage.get().layers).toHaveLength(1))

    expect(currentPage.get().layers![0].owner).toBe(currentPage.id())

    let heard: unknown = null
    router.layerHandle().on('saved', (payload) => (heard = payload))
    handle.emit('saved', { id: 5 })

    expect(heard).toEqual({ id: 5 })
  })
})

describe('local layers: router.layer({ component, props })', () => {
  const client = http.getClient()

  beforeEach(() => {
    prefetchedRequests.removeAll()
  })

  afterEach(() => {
    http.setClient(client)
    layerClosing.settleUnwind()
    vi.restoreAllMocks()
  })

  it('opens a local layer with no url of its own, owned by the topmost layer', async () => {
    await hold(composeLayer(pageWith(), editLayer(), 'layer-1'))
    const [opener] = currentPage.get().layers!

    const handle = router.layer({ component: 'Users/Notes', props: { user: { id: 5 } } })
    await vi.waitFor(() => expect(currentPage.get().layers).toHaveLength(2))

    const [routed, local] = currentPage.get().layers!
    expect(local.id).toBe(handle.id)
    expect(local.url).toBeNull()
    expect(local.key).toBe('Users/Notes')
    expect(local.owner).toBe(opener.id)
    expect(local.props).toEqual({ user: { id: 5 } })
    expect(addressOf(currentPage.get())).toBe('/users/5/edit')
    expect(registryRead(local.id)).toBe(handle)
  })

  it('makes the page the owner of a local layer opened from it', async () => {
    await hold(pageWith())
    const baseId = currentPage.id()

    router.layer({ component: 'Users/Notes', props: { user: { id: 5 } } })
    await vi.waitFor(() => expect(currentPage.get().layers).toHaveLength(1))

    expect(currentPage.get().layers![0].owner).toBe(baseId)
  })

  it('writes a history entry for a local open, at the address the stack already owns', async () => {
    await hold(composeLayer(pageWith(), editLayer(), 'layer-1'))
    const pushState = vi.spyOn(window.history, 'pushState')

    router.layer({ component: 'Users/Notes', props: { user: { id: 5 } } })
    await vi.waitFor(() => expect(currentPage.get().layers).toHaveLength(2))
    await history.processQueue()

    expect(pushState).toHaveBeenCalledWith(expect.anything(), '', '/users/5/edit')
    expect(currentPage.get().layers![1].entries).toBe(1)
  })

  it('serialises a local layer into an entry', async () => {
    await hold(pageWith())
    http.setClient({
      request: async () => ({ status: 200, data: editLayer(), headers: { 'x-inertia': 'true' } }),
    })

    const routed = router.layer('http://localhost/users/5/edit')
    await vi.waitFor(() => expect(currentPage.get().layers).toHaveLength(1))

    const local = router.layer({ component: 'Users/Notes', props: { user: { id: 5 } } })
    await vi.waitFor(() => expect(currentPage.get().layers).toHaveLength(2))

    const replaceState = vi.spyOn(window.history, 'replaceState')
    await new Promise<void>((resolve) => {
      new Router().replace({ props: { users: [{ id: 9 }] }, onSuccess: () => resolve() })
    })

    const [state] = replaceState.mock.lastCall as unknown as [{ page: Page }]
    expect(state.page.layers!.map((layer) => layer.id)).toEqual([routed.id, local.id])
    expect(state.page.layers![1]).toMatchObject({ local: true, component: 'Users/Notes', props: { user: { id: 5 } } })
  })

  it('drops a local layer on restore, firing its handle onClose once', async () => {
    await hold(pageWith())

    const handle = router.layer({ component: 'Users/Notes', props: { user: { id: 5 } } })
    await vi.waitFor(() => expect(currentPage.get().layers).toHaveLength(1))

    let fires = 0
    handle.onClose(() => fires++)

    await currentPage.setQuietly(pageWith())

    expect(fires).toBe(1)
    expect(registryHas(handle.id)).toBe(false)
    expect(currentPage.get().layers).toBeUndefined()
  })

  it('gives two local opens two ids and two handles, and closing one leaves the other', async () => {
    await hold(pageWith())
    http.setClient({
      request: async () => ({ status: 200, data: pageWith(), headers: { 'x-inertia': 'true' } }),
    })

    const first = router.layer({ component: 'Users/Notes', props: { user: { id: 5 } } })
    await vi.waitFor(() => expect(currentPage.get().layers).toHaveLength(1))
    const second = router.layer({ component: 'Users/Notes', props: { user: { id: 6 } } })
    await vi.waitFor(() => expect(currentPage.get().layers).toHaveLength(2))

    const [a, b] = currentPage.get().layers!
    expect(a.id).not.toBe(b.id)
    expect(a.key).toBe('Users/Notes')
    expect(registryRead(a.id)).toBe(first)
    expect(registryRead(b.id)).toBe(second)

    second.close()
    await settled()
    layerClosing.closed(b.id)
    await history.processQueue()

    eventHandler.init()
    listeners.get('popstate')!({
      state: { page: { ...currentPage.get(), layers: [a] } },
    } as PopStateEvent)

    await vi.waitFor(() => expect(currentPage.get().layers!.map((layer) => layer.id)).toEqual([a.id]))
    await vi.waitFor(() => expect(registryHas(b.id)).toBe(false))
    expect(registryHas(a.id)).toBe(true)
  })

  it('does not let a routed response rewrite an open local layer', async () => {
    await hold(pageWith())

    const local = router.layer({ component: 'Users/Edit', props: { user: { id: 5 } } })
    await vi.waitFor(() => expect(currentPage.get().layers).toHaveLength(1))
    const [localLayer] = currentPage.get().layers!

    http.setClient({
      request: async () => ({ status: 200, data: editLayer(), headers: { 'x-inertia': 'true' } }),
    })
    const routed = router.layer('http://localhost/users/5/edit')
    await vi.waitFor(() => expect(currentPage.get().layers).toHaveLength(2))

    const [stillLocal, composed] = currentPage.get().layers!
    expect(stillLocal).toEqual(localLayer)
    expect(composed.id).toBe(routed.id)
    expect(composed.key).toBe('Users/Edit')
    expect(registryRead(composed.id)).toBe(routed)
    expect(registryRead(stillLocal.id)).toBe(local)
  })
})

describe('closing a layer', () => {
  const layerWith = (overrides: Partial<LayerState>, index: number): LayerState => ({
    id: `layer-${index + 1}`,
    key: `L${index}`,
    component: `L${index}`,
    props: {},
    url: null,
    base: null,
    encryptHistory: false,
    standalone: false,
    entries: 0,
    owner: null,
    deferredProps: {},
    rescuedProps: [],
    flash: {},
    onceProps: {},
    ...overrides,
  })

  let swapped: ResolvedLayer[] | undefined

  const openOver = (base: Page, ...layers: Partial<LayerState>[]) =>
    currentPage.init({
      initialPage: { ...base, layers: layers.map(layerWith) },
      resolveComponent: (name) => ({ name }) as never,
      swapComponent: async ({ layers }) => {
        swapped = layers
      },
    })

  const markClose = async (id?: string): Promise<void> => {
    layerClosing.close(id)

    await settled()
  }

  const closeFully = async (id?: string): Promise<Promise<void>[]> => {
    await markClose(id)

    const exits = (currentPage.get().layers ?? []).map((layer) => layerClosing.closed(layer.id))

    await history.processQueue()

    return exits
  }

  const reportExit = async (id?: string) => {
    layerClosing.closed(id)

    await history.processQueue()
  }

  const standing = (address: string) => {
    Object.assign(window, { location: new URL(`http://localhost${address}`) })
  }

  afterEach(() => {
    layerClosing.settleUnwind()
    standing('/users')
    vi.restoreAllMocks()
  })

  it('resolves once the layer is off the screen, not when it starts closing', async () => {
    openOver(pageWith(), { url: null })
    let settledClose = false

    const closed = layerClosing.close('layer-1').then(() => (settledClose = true))

    await settled()

    expect(currentPage.get().layers).toHaveLength(1)
    expect(settledClose).toBe(false)

    await reportExit('layer-1')
    await closed

    expect(currentPage.get().layers).toBeUndefined()
  })

  it('unwinds the steps taken over a cold layer before writing the page beneath it', async () => {
    openOver(pageWith(), { url: '/users/5/edit', standalone: true }, { url: '/users/5/notes', entries: 1 })
    standing('/users/5/notes')
    const go = vi.spyOn(window.history, 'go')

    await closeFully('layer-1')

    expect(go).toHaveBeenCalledWith(-1)
  })

  it('unwinds to the entry the layer beneath is on', async () => {
    openOver(pageWith(), { url: '/users/5/edit', entries: 1 })
    const go = vi.spyOn(window.history, 'go')

    await closeFully()

    expect(go).toHaveBeenCalledWith(-1)
  })

  it('unwinds past every layer above the one being closed', async () => {
    openOver(pageWith(), { url: '/users/5/edit', entries: 1 }, { url: '/teams/9', entries: 1 })
    const go = vi.spyOn(window.history, 'go')

    await closeFully('layer-1')

    expect(go).toHaveBeenCalledWith(-2)
  })

  it('closes the topmost layer when none is named', async () => {
    openOver(pageWith(), { url: '/users/5/edit', entries: 1 }, { url: '/teams/9', entries: 1 })
    const go = vi.spyOn(window.history, 'go')

    await closeFully()

    expect(go).toHaveBeenCalledWith(-1)
  })

  it('does not unwind past a layer that never moved the address', async () => {
    openOver(pageWith(), { url: '/users/5/edit', entries: 1 }, { url: null })
    const go = vi.spyOn(window.history, 'go')

    await closeFully('layer-1')

    expect(go).toHaveBeenCalledWith(-1)
  })

  it('does not unwind past a layer that only moved the address by a hash', async () => {
    openOver(pageWith(), { url: '/users/5/edit', entries: 1 }, { url: '/users/5/edit#notes' })
    const go = vi.spyOn(window.history, 'go')

    await closeFully('layer-1')

    expect(go).toHaveBeenCalledWith(-1)
  })

  it('unwinds every entry the layer pushed, not just the one the open did', async () => {
    openOver(pageWith())
    const go = vi.spyOn(window.history, 'go')

    await currentPage.set(
      composeLayer(
        currentPage.get(),
        pageWith({ component: 'Steps/One', layer: { key: 'Wizard' }, url: '/steps/1' }),
        'layer-1',
      ),
      { preservesBase: true },
    )
    standing('/steps/1')

    await currentPage.set(
      composeLayer(
        currentPage.get(),
        pageWith({ component: 'Steps/Two', layer: { key: 'Wizard' }, url: '/steps/2' }),
        'layer-2',
      ),
      { preservesBase: true },
    )
    standing('/steps/2')

    await closeFully()

    expect(go).toHaveBeenCalledWith(-2)
  })

  it('records each entry pushed on the layer that owns the address', async () => {
    openOver(pageWith())
    const pushState = vi.spyOn(window.history, 'pushState')

    await currentPage.set(
      composeLayer(
        currentPage.get(),
        pageWith({ component: 'Steps/One', layer: { key: 'Wizard' }, url: '/steps/1' }),
        'layer-1',
      ),
      { preservesBase: true },
    )
    standing('/steps/1')

    await currentPage.set(
      composeLayer(
        currentPage.get(),
        pageWith({ component: 'Steps/Two', layer: { key: 'Wizard' }, url: '/steps/2' }),
        'layer-2',
      ),
      { preservesBase: true },
    )

    expect(currentPage.get().layers!.map((layer) => layer.entries)).toEqual([2])
    expect(pushState.mock.lastCall![0].page.layers.map((layer: LayerState) => layer.entries)).toEqual([2])
  })

  it('counts a history entry an anchor pushed inside a layer', async () => {
    openOver(pageWith(), { url: '/users/5/edit', entries: 1 })
    standing('/users/5/edit#notes')
    eventHandler.init()

    listeners.get('popstate')!({ state: null } as PopStateEvent)
    await history.processQueue()

    expect(currentPage.get().layers!.map((layer) => layer.entries)).toEqual([2])

    const go = vi.spyOn(window.history, 'go')

    await closeFully()

    expect(go).toHaveBeenCalledWith(-2)
  })

  it('records a step on a layer opened at the address the page beneath already has', async () => {
    openOver(pageWith())

    await currentPage.set(
      composeLayer(
        currentPage.get(),
        pageWith({ component: 'Users/Edit', layer: { key: 'Users/Edit' }, url: '/users' }),
        'layer-1',
      ),
      { preservesBase: true },
    )

    expect(currentPage.get().layers!.map((layer) => layer.entries)).toEqual([1])
  })

  it('steps back only after the writes ahead of it have landed', async () => {
    openOver(pageWith())
    const order: string[] = []
    vi.spyOn(window.history, 'pushState').mockImplementation(() => {
      order.push('write')
    })
    vi.spyOn(window.history, 'go').mockImplementation(() => {
      order.push('back')
    })

    history.pushState(pageWith({ url: '/elsewhere' }), null)
    history.back(1)
    await history.processQueue()

    expect(order).toEqual(['write', 'back'])
  })

  it('writes the page beneath a layer that never moved the address', async () => {
    openOver(pageWith(), { url: '/users/5/edit', entries: 1 }, { url: null })
    standing('/users/5/edit')
    const go = vi.spyOn(window.history, 'go')
    const replaceState = vi.spyOn(history, 'replaceState')

    await Promise.all(await closeFully('layer-2'))

    expect(go).not.toHaveBeenCalled()
    expect(replaceState).toHaveBeenCalled()
    expect(currentPage.get().layers!.map((layer) => layer.id)).toEqual(['layer-1'])
  })

  it('pushes the page beneath a standalone layer, leaving the entry the layer arrived on', async () => {
    openOver(pageWith(), { url: '/users/5/edit', standalone: true })
    standing('/users/5/edit')
    const go = vi.spyOn(window.history, 'go')
    const pushState = vi.spyOn(history, 'pushState')

    await Promise.all(await closeFully())

    expect(go).not.toHaveBeenCalled()
    expect(pushState).toHaveBeenCalled()
    expect(currentPage.get().component).toBe('Users/Index')
    expect(currentPage.get()).not.toHaveProperty('layers')
  })

  it('closes every layer above the one it was asked to close', async () => {
    openOver(pageWith(), { url: '/a', standalone: true }, { url: '/b', entries: 1 }, { url: '/c', entries: 1 })
    standing('/c')
    const go = vi.spyOn(window.history, 'go')

    await closeFully('layer-1')

    expect(go).toHaveBeenCalledWith(-2)
    expect(layerClosing.isUnwinding()).toBe(true)
  })

  it('leaves the page the stack was opened over in place', async () => {
    openOver(pageWith(), { url: '/users/5/edit', standalone: true })
    standing('/users/5/edit')
    const generation = currentPage.generation()

    await Promise.all(await closeFully())

    expect(currentPage.generation()).toBe(generation)
  })

  it('does nothing when there is no stack to close', async () => {
    currentPage.init({
      initialPage: pageWith(),
      resolveComponent: (name) => ({ name }) as never,
      swapComponent: async () => {},
    })
    const go = vi.spyOn(window.history, 'go')
    const pushState = vi.spyOn(history, 'pushState')

    await closeFully()

    expect(go).not.toHaveBeenCalled()
    expect(pushState).not.toHaveBeenCalled()
  })

  it('does nothing when the layer named is not on the stack', async () => {
    openOver(pageWith(), { url: '/users/5/edit', entries: 1 })
    const go = vi.spyOn(window.history, 'go')
    const pushState = vi.spyOn(history, 'pushState')

    await closeFully('layer-9')

    expect(go).not.toHaveBeenCalled()
    expect(pushState).not.toHaveBeenCalled()
    expect(currentPage.get().layers!.map((layer) => layer.id)).toEqual(['layer-1'])
  })

  it('closes a stack restored from history to the same place', async () => {
    currentPage.init({
      initialPage: pageWith(),
      resolveComponent: (name) => ({ name }) as never,
      swapComponent: async () => {},
    })
    const pushState = vi.spyOn(window.history, 'pushState')
    const layer = pageWith({
      component: 'Users/Edit',
      url: '/users/5/edit',
      layer: { key: 'Users/Edit' },
      encryptHistory: true,
    })

    await currentPage.set(composeLayer(currentPage.get(), layer, 'layer-1', { url: layer.url, standalone: true }), {
      preservesBase: true,
    })

    const entry = pushState.mock.lastCall![0].page

    expect(entry).toBeInstanceOf(ArrayBuffer)

    const restored = await history.decrypt(entry)

    expect(restored.layers).toEqual([expect.objectContaining({ id: 'layer-1', standalone: true })])
  })

  it('closeAbove waits for the layers it marked, not for a close still refreshing', async () => {
    const client = http.getClient()
    openOver(pageWith(), { url: null }, { url: null }, { url: null })

    let answerRefresh: ((response: unknown) => void) | null = null
    http.setClient({ request: () => new Promise((resolve) => (answerRefresh = resolve)) })

    router.close('layer-3')
    await settled()
    await reportExit('layer-3')
    await settled()

    expect(currentPage.get().layers!.map((layer) => layer.id)).toEqual(['layer-1', 'layer-2'])

    let closedAbove = false
    const above = layerClosing.closeAbove('layer-1').then(() => (closedAbove = true))

    await settled()
    answerRefresh!({ status: 200, data: pageWith() as unknown as string, headers: { 'x-inertia': 'true' } })
    await settled()

    expect(closedAbove).toBe(false)

    await reportExit('layer-2')
    await above

    expect(currentPage.get().layers!.map((layer) => layer.id)).toEqual(['layer-1'])
    http.setClient(client)
  })

  describe('the window between close and done', () => {
    it('marks the layer rather than removing it', async () => {
      openOver(pageWith(), { url: '/users/5/edit', entries: 1 })

      await markClose()

      expect(currentPage.get().layers!.map((layer) => layer.id)).toEqual(['layer-1'])
      expect(swapped!.map((layer) => layer.isClosing)).toEqual([true])
    })

    it('marks every layer above the one being closed', async () => {
      openOver(pageWith(), { url: '/a', entries: 1 }, { url: '/b', entries: 1 }, { url: '/c', entries: 1 })

      await markClose('layer-2')

      expect(swapped!.map((layer) => layer.isClosing)).toEqual([false, true, true])
    })

    it('leaves history alone until the exit has run', async () => {
      openOver(pageWith(), { url: '/users/5/edit', entries: 1 })
      const go = vi.spyOn(window.history, 'go')
      const pushState = vi.spyOn(history, 'pushState')
      const replaceState = vi.spyOn(history, 'replaceState')

      await markClose()

      expect(go).not.toHaveBeenCalled()
      expect(pushState).not.toHaveBeenCalled()
      expect(replaceState).not.toHaveBeenCalled()
    })

    it('removes the layer once the exit has run', async () => {
      openOver(pageWith(), { url: '/users/5/edit', entries: 1 })
      const go = vi.spyOn(window.history, 'go')

      await markClose()
      await reportExit()

      expect(go).toHaveBeenCalledWith(-1)
    })

    it('waits for every layer it marked before removing any of them', async () => {
      openOver(pageWith(), { url: '/a', entries: 1 }, { url: '/b', entries: 1 })
      standing('/b')
      const go = vi.spyOn(window.history, 'go')

      await markClose('layer-1')
      await layerClosing.closed('layer-2')

      expect(go).not.toHaveBeenCalled()

      await reportExit('layer-1')

      expect(go).toHaveBeenCalledWith(-2)
    })

    it('ignores an exit reported by a layer nobody closed', async () => {
      openOver(pageWith(), { url: '/a', entries: 1 }, { url: '/b', entries: 1 })
      const go = vi.spyOn(window.history, 'go')

      await layerClosing.closed('layer-2')

      expect(go).not.toHaveBeenCalled()
      expect(currentPage.get().layers!.map((layer) => layer.id)).toEqual(['layer-1', 'layer-2'])
    })

    it('does not restart an exit already under way', async () => {
      openOver(pageWith(), { url: '/a', entries: 1 }, { url: '/b', entries: 1 })
      standing('/b')
      const go = vi.spyOn(window.history, 'go')

      await markClose('layer-1')
      await layerClosing.closed('layer-2')
      await markClose('layer-1')
      await reportExit('layer-1')

      expect(go).toHaveBeenCalledWith(-2)
    })

    it('keeps the exits already reported when a close widens to a lower layer', async () => {
      openOver(pageWith(), { url: '/a', entries: 1 }, { url: '/b', entries: 1 }, { url: '/c', entries: 1 })
      standing('/c')
      const go = vi.spyOn(window.history, 'go')

      await markClose('layer-2')
      await layerClosing.closed('layer-3')
      await markClose('layer-1')
      await layerClosing.closed('layer-2')
      await reportExit('layer-1')

      expect(go).toHaveBeenCalledWith(-3)
    })

    it('cancels the pending removal when the layer is superseded', async () => {
      openOver(pageWith(), { url: '/users/5/edit', entries: 1 })
      const go = vi.spyOn(window.history, 'go')

      await markClose()
      await currentPage.set(
        composeLayer(
          currentPage.get(),
          pageWith({ component: 'L0', layer: { key: 'L0' }, url: '/users/5/edit' }),
          'layer-2',
          { remount: true },
        ),
        { preservesBase: true },
      )

      expect(swapped!.map((layer) => layer.isClosing)).toEqual([false])

      await layerClosing.closed('layer-1')

      expect(go).not.toHaveBeenCalled()
      expect(currentPage.get().layers!.map((layer) => layer.id)).toEqual(['layer-1'])
    })

    it('keeps the pending removal when the layer is refreshed where it stands', async () => {
      openOver(pageWith(), { url: '/users/5/edit', entries: 1 })
      standing('/users/5/edit')
      const go = vi.spyOn(window.history, 'go')

      await markClose()
      await currentPage.set(
        composeLayer(
          currentPage.get(),
          pageWith({ component: 'L0', layer: { key: 'L0' }, url: '/users/5/edit', props: { users: ['ada'] } }),
          'layer-2',
        ),
        { preservesBase: true },
      )

      expect(swapped!.map((layer) => layer.isClosing)).toEqual([true])
      expect(currentPage.get().layers![0].props).toEqual({ users: ['ada'] })

      await layerClosing.closed('layer-1')

      expect(go).toHaveBeenCalledWith(-1)
    })

    it('keeps a layer being closed out of the entry a write leaves behind', async () => {
      openOver(pageWith(), { url: '/a', entries: 1 }, { url: '/b', entries: 1 })
      standing('/b')
      const replaceState = vi.spyOn(window.history, 'replaceState')

      await markClose('layer-2')
      await currentPage.set({ ...currentPage.get(), props: { users: ['ada'] } }, { preservesBase: true })

      expect(replaceState.mock.lastCall![0].page.layers.map((layer: LayerState) => layer.id)).toEqual(['layer-1'])
      expect(replaceState.mock.lastCall![2]).toBe('/b')
    })

    it('keeps a layer being closed on the page it is rendered from', async () => {
      openOver(pageWith(), { url: '/a', entries: 1 }, { url: '/b', entries: 1 })
      standing('/b')

      await markClose('layer-2')
      await currentPage.set({ ...currentPage.get(), props: { users: ['ada'] } }, { preservesBase: true })

      expect(currentPage.get().layers!.map((layer) => layer.id)).toEqual(['layer-1', 'layer-2'])
      expect(swapped!.map((layer) => layer.isClosing)).toEqual([false, true])
    })

    it('does nothing on a page that has no stack at all', async () => {
      currentPage.init({
        initialPage: pageWith(),
        resolveComponent: (name) => ({ name }) as never,
        swapComponent: async ({ layers }) => {
          swapped = layers
        },
      })
      const go = vi.spyOn(window.history, 'go')
      const pushState = vi.spyOn(history, 'pushState')

      await markClose()
      await layerClosing.closed()

      expect(go).not.toHaveBeenCalled()
      expect(pushState).not.toHaveBeenCalled()
    })
  })

  describe('while the unwind is in flight', () => {
    it('does not unwind a second time for a close issued inside the window', async () => {
      openOver(pageWith(), { url: '/users/5/edit', entries: 1 })
      standing('/users/5/edit')
      const go = vi.spyOn(window.history, 'go')

      await closeFully()

      expect(go).toHaveBeenCalledTimes(1)

      await closeFully()

      expect(go).toHaveBeenCalledTimes(1)
    })

    it('resolves an exit only once the browser has restored what was beneath', async () => {
      openOver(pageWith(), { url: '/users/5/edit', entries: 1 })
      standing('/users/5/edit')
      vi.spyOn(window.history, 'go')
      eventHandler.init()

      await markClose()
      let resolved = false
      const exit = layerClosing.closed().then(() => {
        resolved = true
      })
      await history.processQueue()

      expect(resolved).toBe(false)

      listeners.get('popstate')!({ state: { page: pageWith() } } as PopStateEvent)
      await exit

      expect(resolved).toBe(true)
      expect(currentPage.get().layers).toBeUndefined()
    })

    it('does not put a standalone layer back on screen when the step back restores the entry holding it', async () => {
      openOver(pageWith(), {
        key: 'Users/Edit',
        component: 'Users/Edit',
        url: '/users/6/edit',
        standalone: true,
        entries: 1,
      })
      standing('/users/6/edit')
      const go = vi.spyOn(window.history, 'go')
      const pushState = vi.spyOn(history, 'pushState')
      eventHandler.init()

      const stillHoldingTheLayer = currentPage.get()

      await markClose()
      const exit = layerClosing.closed()
      await history.processQueue()

      expect(go).toHaveBeenCalledWith(-1)

      listeners.get('popstate')!({ state: { page: stillHoldingTheLayer } } as PopStateEvent)
      await exit

      expect(currentPage.get().component).toBe('Users/Index')
      expect(currentPage.get()).not.toHaveProperty('layers')
      expect(pushState).toHaveBeenCalled()
    })

    it('holds an instant visit until the step back has restored', async () => {
      openOver(pageWith(), { key: 'Users/Edit', component: 'Users/Edit', url: '/users/5/edit', entries: 1 })
      standing('/users/5/edit')
      vi.spyOn(window.history, 'go')
      eventHandler.init()
      http.setClient({ request: () => new Promise(() => {}) })

      await closeFully()

      new Router().visit('/users/9', { component: 'Users/Show' } as VisitOptions)
      await settled()

      expect(currentPage.get().component).toBe('Users/Index')

      listeners.get('popstate')!({ state: { page: pageWith() } } as PopStateEvent)

      await vi.waitFor(() => expect(currentPage.get().component).toBe('Users/Show'))
      expect(currentPage.get().layers).toBeUndefined()
    })

    it('holds a response that lands mid-close until the step back has restored', async () => {
      openOver(pageWith(), { key: 'Users/Edit', component: 'Users/Edit', url: '/users/5/edit', entries: 1 })
      standing('/users/5/edit')
      vi.spyOn(window.history, 'go')
      eventHandler.init()
      let answer: ((response: unknown) => void) | null = null
      http.setClient({ request: () => new Promise((resolve) => (answer = resolve)) })

      const settled = new Promise<Page>((resolve) => {
        const settle = () => resolve(currentPage.get())
        new Router().visit('http://localhost/users/5', { method: 'post', onSuccess: settle, onError: settle })
      })
      await vi.waitFor(() => expect(answer).not.toBeNull())

      await closeFully()

      answer!({
        status: 200,
        data: pageWith({ component: 'Users/Edit', url: '/users/5/edit', layer: { key: 'Users/Edit' } }),
        headers: { 'x-inertia': 'true' },
      })
      await new Promise((resolve) => setTimeout(resolve, 0))

      listeners.get('popstate')!({ state: { page: pageWith() } } as PopStateEvent)
      const page = await settled

      expect(page.component).toBe('Users/Edit')
      expect(page.layers).toBeUndefined()
    })
  })
})

describe('closing through the router', () => {
  const open = () =>
    currentPage.init({
      initialPage: {
        ...pageWith(),
        layers: [
          {
            id: 'layer-1',
            key: 'Users/Edit',
            component: 'Users/Edit',
            props: {},
            url: '/users/5/edit',
            base: null,
            encryptHistory: false,
            standalone: false,
            entries: 1,
            owner: null,
          },
        ],
      },
      resolveComponent: (name) => ({ name }) as never,
      swapComponent: async () => {},
    })

  afterEach(() => {
    layerClosing.settleUnwind()
    vi.restoreAllMocks()
  })

  it('closes the topmost layer when none is named', async () => {
    open()
    const go = vi.spyOn(window.history, 'go')
    const router = new Router()

    router.close()
    await settled()
    router.closed()
    await history.processQueue()

    expect(go).toHaveBeenCalledWith(-1)
  })

  it('closes the layer a shell names', async () => {
    open()
    const go = vi.spyOn(window.history, 'go')
    const router = new Router()

    router.close('layer-1')
    await settled()
    router.closed('layer-1')
    await history.processQueue()

    expect(go).toHaveBeenCalledWith(-1)
  })
})

describe('the layer registry', () => {
  const handle = {
    id: 'layer-1',
    on: () => {},
    onClose: () => {},
    close: async () => {},
    emit: () => {},
    deliver: () => {},
    fireOnClose: () => {},
  }

  const layerWith = (overrides: Partial<LayerState>, index: number): LayerState => ({
    id: `layer-${index + 1}`,
    key: `L${index}`,
    component: `L${index}`,
    props: {},
    url: null,
    base: null,
    encryptHistory: false,
    standalone: false,
    entries: 0,
    owner: null,
    deferredProps: {},
    rescuedProps: [],
    flash: {},
    onceProps: {},
    ...overrides,
  })

  const openOver = (base: Page, ...layers: Partial<LayerState>[]) =>
    currentPage.init({
      initialPage: { ...base, layers: layers.map(layerWith) },
      resolveComponent: (name) => ({ name }) as never,
      swapComponent: async () => {},
    })

  const standing = (address: string) => {
    Object.assign(window, { location: new URL(`http://localhost${address}`) })
  }

  afterEach(() => {
    registryClose('layer-1')
    registryClose('layer-2')
    layerClosing.settleUnwind()
    standing('/users')
    vi.restoreAllMocks()
  })

  it('keeps no handle when there is no browser, so a server render never shares one', () => {
    const browser = globalThis.window

    try {
      // @ts-expect-error the render has no window to read
      delete globalThis.window

      const first = router.layerHandle('rendered-layer')
      const second = router.layerHandle('rendered-layer')

      expect(second).not.toBe(first)
    } finally {
      globalThis.window = browser
    }

    expect(registryHas('rendered-layer')).toBe(false)
  })

  it('hands back the handle written for a layer id', () => {
    registryWrite('layer-1', handle)

    expect(registryRead('layer-1')).toBe(handle)
    expect(registryHas('layer-1')).toBe(true)
  })

  it('releases the handle of a layer once its removal has settled', async () => {
    openOver(pageWith(), { url: '/users/5/edit', entries: 1 })
    registryWrite('layer-1', handle)

    await marked()
    layerClosing.closed('layer-1')
    await history.processQueue()

    expect(registryHas('layer-1')).toBe(true)

    eventHandler.init()
    listeners.get('popstate')!({ state: { page: pageWith() } } as PopStateEvent)
    await vi.waitFor(() => expect(registryHas('layer-1')).toBe(false))
  })

  it('releases the handle of a layer whose close is dropped', async () => {
    openOver(pageWith(), { url: '/users/5/edit', entries: 1 })
    registryWrite('layer-1', handle)

    await marked()
    await currentPage.set(pageWith({ component: 'Users/Show', url: '/users/5' }))

    expect(registryHas('layer-1')).toBe(false)
  })

  it('keeps the handle of a layer that is superseded under its own id', async () => {
    openOver(pageWith(), { url: '/users/5/edit', entries: 1 })
    registryWrite('layer-1', handle)

    await marked()
    await currentPage.set(
      composeLayer(
        currentPage.get(),
        pageWith({ component: 'L0', layer: { key: 'L0' }, url: '/users/5/edit' }),
        'layer-2',
      ),
      { preservesBase: true },
    )

    expect(registryHas('layer-1')).toBe(true)
  })
})
