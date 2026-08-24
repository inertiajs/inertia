import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { historySessionStorageKeys } from '../src/encryption'
import { eventHandler } from '../src/eventHandler'
import { history } from '../src/history'
import { http } from '../src/http'
import { InitialVisit } from '../src/initialVisit'
import { composeLayer, encryptsHistory } from '../src/layers'
import { navigationType } from '../src/navigationType'
import { page as currentPage } from '../src/page'
import { prefetchedRequests } from '../src/prefetched'
import { Router } from '../src/router'
import { Page } from '../src/types'
import { listeners } from './support/browser'
import { editLayer, hold, pageWith, respondWith } from './support/layers'

describe('the history entry a layer open leaves behind', () => {
  const initWith = (page: Page) =>
    currentPage.init({
      initialPage: page,
      resolveComponent: (name) => ({ name }) as never,
      swapComponent: async () => {},
    })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('is pushed, so the entry the base sits on survives', async () => {
    initWith(pageWith())
    const pushState = vi.spyOn(history, 'pushState')
    const replaceState = vi.spyOn(history, 'replaceState')

    const layer = pageWith({ component: 'Users/Edit', url: '/users/5/edit', layer: { key: 'Users/Edit' } })

    await currentPage.set(composeLayer(currentPage.get(), layer, 'layer-1'), { preservesBase: true })

    expect(pushState).toHaveBeenCalled()
    expect(replaceState).not.toHaveBeenCalled()
  })

  it('is still replaced when a page lands where the user already is', async () => {
    initWith(pageWith())
    const pushState = vi.spyOn(history, 'pushState')
    const replaceState = vi.spyOn(history, 'replaceState')

    await currentPage.set(pageWith({ props: { users: [{ id: 1 }] } }))

    expect(replaceState).toHaveBeenCalled()
    expect(pushState).not.toHaveBeenCalled()
  })

  it("carries the layer's address, so the address bar shows the layer", async () => {
    initWith(pageWith())
    const pushState = vi.spyOn(window.history, 'pushState')

    const layer = pageWith({ component: 'Users/Edit', url: '/users/5/edit', layer: { key: 'Users/Edit' } })

    await currentPage.set(composeLayer(currentPage.get(), layer, 'layer-1'), { preservesBase: true })

    expect(pushState).toHaveBeenCalledWith(
      expect.objectContaining({
        page: expect.objectContaining({
          url: '/users',
          layers: [expect.objectContaining({ id: 'layer-1', url: '/users/5/edit' })],
        }),
      }),
      '',
      '/users/5/edit',
    )
  })

  it("carries the page's own url when there are no layers", async () => {
    initWith(pageWith())
    const pushState = vi.spyOn(window.history, 'pushState')

    await currentPage.set(pageWith({ component: 'Users/Show', url: '/users/5' }))

    expect(pushState).toHaveBeenCalledWith(expect.anything(), '', '/users/5')
  })

  it("serialises a layer's own fields onto the entry, and nothing more", async () => {
    initWith(pageWith())
    const pushState = vi.spyOn(window.history, 'pushState')

    const layer = pageWith({ component: 'Users/Edit', url: '/users/5/edit', layer: { key: 'Users/Edit' } })

    await currentPage.set(composeLayer(currentPage.get(), layer, 'layer-1'), { preservesBase: true })

    const [state] = pushState.mock.lastCall as unknown as [{ page: Page }]

    expect(Object.keys(state.page.layers![0]).sort()).toEqual([
      'base',
      'component',
      'deferredProps',
      'encryptHistory',
      'entries',
      'flash',
      'id',
      'initialDeferredProps',
      'key',
      'onceProps',
      'owner',
      'props',
      'renderKey',
      'rescuedProps',
      'scrollProps',
      'standalone',
      'url',
    ])
  })

  it('counts the entry it pushed against the layer that owns the address', async () => {
    initWith(pageWith())

    await currentPage.set(composeLayer(currentPage.get(), editLayer(), 'layer-1'), { preservesBase: true })

    expect(currentPage.get().layers![0].entries).toBe(1)
  })

  it('gives the count back when the browser refuses the entry', async () => {
    initWith(pageWith())
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(window.history, 'pushState').mockImplementation(() => {
      const refusal = new Error('Attempt to use history.pushState() more than 100 times per 10 seconds')
      refusal.name = 'SecurityError'
      throw refusal
    })

    await currentPage.set(composeLayer(currentPage.get(), editLayer(), 'layer-1'), { preservesBase: true })

    expect(currentPage.get().layers![0].entries).toBe(0)
  })

  it("keeps the layer's address when the page beneath it is rewritten in place", async () => {
    const layer = pageWith({ component: 'Users/Edit', url: '/users/5/edit', layer: { key: 'Users/Edit' } })
    initWith(composeLayer(pageWith(), layer, 'layer-1'))
    const replaceState = vi.spyOn(window.history, 'replaceState')

    await new Promise<void>((resolve) => {
      new Router().replace({ props: { users: [{ id: 1 }] }, onSuccess: () => resolve() })
    })

    expect(replaceState).toHaveBeenCalledWith(expect.anything(), '', '/users/5/edit')
  })

  it('leaves the flash off the entry a close rewrites in place', async () => {
    await hold(pageWith({ flash: { message: 'Saved.' } }))
    respondWith(pageWith({ flash: { message: 'Saved.' } }))

    await currentPage.set(composeLayer(currentPage.get(), editLayer(), 'layer-1'), {
      preservesBase: true,
      replace: true,
    })

    const replaceState = vi.spyOn(history, 'replaceState')
    const router = new Router()
    let closed = false
    router.layerHandle('layer-1').onClose(() => (closed = true))

    await router.close('layer-1')

    await vi.waitFor(() => expect(closed).toBe(true))

    expect(currentPage.get().flash).toEqual({ message: 'Saved.' })
    expect(replaceState.mock.calls.map(([page]) => page.flash)).not.toContainEqual({ message: 'Saved.' })
  })

  it("rewrites in place with the page's own url when there are no layers", async () => {
    initWith(pageWith())
    const replaceState = vi.spyOn(window.history, 'replaceState')

    await new Promise<void>((resolve) => {
      new Router().replace({ props: { users: [{ id: 1 }] }, onSuccess: () => resolve() })
    })

    expect(replaceState).toHaveBeenCalledWith(expect.anything(), '', '/users')
  })
})

describe('a document loaded onto a back_forward entry holding a stack', () => {
  afterEach(() => {
    Object.assign(window, { location: new URL('http://localhost/users') })
    vi.restoreAllMocks()
  })

  it('rewrites the entry it was handed rather than pushing another', async () => {
    const cold = composeLayer(pageWith({ component: '', url: '/users' }), editLayer(), 'layer-1', {
      standalone: true,
    })

    currentPage.init({
      initialPage: cold,
      resolveComponent: (name) => ({ name }) as never,
      swapComponent: async () => {},
    })

    Object.assign(window, { location: new URL('http://localhost/users/5/edit') })

    const restored = composeLayer(pageWith(), editLayer(), 'layer-7') as Page
    const pushState = vi.spyOn(window.history, 'pushState')
    const replaceState = vi.spyOn(window.history, 'replaceState')

    vi.spyOn(history, 'decrypt').mockResolvedValue(restored)
    vi.spyOn(history, 'browserHasHistoryEntry').mockReturnValue(true)
    vi.spyOn(navigationType, 'isBackForward').mockReturnValue(true)

    InitialVisit.handle()

    await new Promise((resolve) => setTimeout(resolve))
    await history.processQueue()

    expect(pushState).not.toHaveBeenCalled()
    expect(replaceState).toHaveBeenCalled()
  })
})

describe('the base beneath a stack a restore moves', () => {
  const swaps: { component: string; preserveState: boolean }[] = []

  const holdWatching = async (page: Page): Promise<void> => {
    currentPage.init({
      initialPage: page,
      resolveComponent: (name) => ({ name }) as never,
      swapComponent: async ({ component, preserveState }) => {
        swaps.push({ component: (component as { name: string } | undefined)?.name ?? '', preserveState })
      },
    })

    await currentPage.setQuietly(page)
  }

  const step = (url: string, entries: number): Page => {
    const page = composeLayer(pageWith(), editLayer({ url }), 'layer-1')
    page.layers![0].entries = entries

    return page
  }

  const restore = async (page: Page): Promise<void> => {
    swaps.length = 0
    listeners.get('popstate')!({ state: { page } } as PopStateEvent)

    await new Promise((resolve) => setTimeout(resolve))
  }

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('is left alone when a back step moves within the layer above it', async () => {
    await holdWatching(step('/users/5/edit/two', 2))
    eventHandler.init()

    await restore(step('/users/5/edit/one', 1))

    expect(swaps).toEqual([{ component: 'Users/Index', preserveState: true }])
  })

  it('is remade when the restore lands on another page altogether', async () => {
    await holdWatching(step('/users/5/edit/two', 2))
    eventHandler.init()

    await restore(pageWith({ component: 'Teams/Index', url: '/teams' }))

    expect(swaps).toEqual([{ component: 'Teams/Index', preserveState: false }])
  })
})

describe('the hash on an entry the browser wrote', () => {
  const initWith = (page: Page) =>
    currentPage.init({
      initialPage: page,
      resolveComponent: (name) => ({ name }) as never,
      swapComponent: async () => {},
    })

  const editLayer = pageWith({ component: 'Users/Edit', url: '/users/5/edit', layer: { key: 'Users/Edit' } })
  const notesLayer = pageWith({ component: 'Users/Notes', url: '/users/5/notes', layer: { key: 'Users/Notes' } })

  const walkOnto = async (address: string): Promise<void> => {
    window.location = new URL(address) as unknown as Location
    eventHandler.init()
    listeners.get('popstate')!({ state: null } as PopStateEvent)

    await history.processQueue()
  }

  afterEach(() => {
    window.location = new URL('http://localhost/users') as unknown as Location
    vi.restoreAllMocks()
  })

  it("writes it onto the page's own url when there are no layers", async () => {
    initWith(pageWith())
    const replaceState = vi.spyOn(window.history, 'replaceState')

    await walkOnto('http://localhost/users#comments')

    expect(replaceState).toHaveBeenCalledWith(
      expect.objectContaining({ page: expect.objectContaining({ url: 'http://localhost/users#comments' }) }),
      '',
      'http://localhost/users#comments',
    )
  })

  it('writes it onto the layer that owns the address, leaving the base beneath it alone', async () => {
    initWith(composeLayer(pageWith(), editLayer, 'layer-1'))
    const replaceState = vi.spyOn(window.history, 'replaceState')

    await walkOnto('http://localhost/users/5/edit#comments')

    expect(replaceState).toHaveBeenCalledWith(
      expect.objectContaining({
        page: expect.objectContaining({
          url: '/users',
          layers: [expect.objectContaining({ url: 'http://localhost/users/5/edit#comments' })],
        }),
      }),
      '',
      'http://localhost/users/5/edit#comments',
    )
  })

  it('writes it onto the layer beneath one with no url of its own', async () => {
    const routed = composeLayer(pageWith(), editLayer, 'layer-1')
    initWith(composeLayer(routed, notesLayer, 'layer-2', { url: null }))
    const replaceState = vi.spyOn(window.history, 'replaceState')

    await walkOnto('http://localhost/users/5/edit#comments')

    expect(replaceState).toHaveBeenCalledWith(
      expect.objectContaining({
        page: expect.objectContaining({
          url: '/users',
          layers: [
            expect.objectContaining({ url: 'http://localhost/users/5/edit#comments' }),
            expect.objectContaining({ url: null }),
          ],
        }),
      }),
      '',
      'http://localhost/users/5/edit#comments',
    )
  })
})

describe('encrypting the history entry a stack leaves behind', () => {
  const initWith = (page: Page) =>
    currentPage.init({
      initialPage: page,
      resolveComponent: (name) => ({ name }) as never,
      swapComponent: async () => {},
    })

  const entryWritten = async (page: Page, options: Parameters<typeof currentPage.set>[1] = {}) => {
    const pushState = vi.spyOn(window.history, 'pushState')

    await currentPage.set(page, options)

    return pushState.mock.lastCall![0].page
  }

  const openedOver = (base: Page, layer: Page) => {
    initWith(base)

    return entryWritten(composeLayer(currentPage.get(), layer, 'layer-1'), { preservesBase: true })
  }

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('encrypts the entry when only the layer asks for it', async () => {
    expect(await openedOver(pageWith(), editLayer({ encryptHistory: true }))).toBeInstanceOf(ArrayBuffer)
  })

  it('encrypts the entry when only the base asks for it', async () => {
    expect(await openedOver(pageWith({ encryptHistory: true }), editLayer())).toBeInstanceOf(ArrayBuffer)
  })

  it('leaves the entry readable when neither asks for it', async () => {
    const entry = await openedOver(pageWith(), editLayer({ props: { user: { id: 5 } } }))

    expect(entry).not.toBeInstanceOf(ArrayBuffer)
    expect(entry.layers).toEqual([expect.objectContaining({ props: { user: { id: 5 } } })])
  })

  it('restores the whole stack from an entry a layer had encrypted', async () => {
    const entry = await openedOver(pageWith(), editLayer({ encryptHistory: true, props: { user: { id: 5 } } }))

    expect(entry).toBeInstanceOf(ArrayBuffer)

    const restored = await history.decrypt(entry)

    expect(restored.url).toBe('/users')
    expect(restored.layers).toEqual([
      expect.objectContaining({ key: 'Users/Edit', props: { user: { id: 5 } }, encryptHistory: true }),
    ])
    expect(encryptsHistory(restored)).toBe(true)
  })

  it('still encrypts a page with no layers that asks for it', async () => {
    initWith(pageWith())

    const entry = await entryWritten(pageWith({ component: 'Users/Show', url: '/users/5', encryptHistory: true }))

    expect(entry).toBeInstanceOf(ArrayBuffer)
  })

  it('leaves a page with no layers that does not ask for it readable', async () => {
    initWith(pageWith())

    const entry = await entryWritten(pageWith({ component: 'Users/Show', url: '/users/5' }))

    expect(entry).not.toBeInstanceOf(ArrayBuffer)
    expect(entry.component).toBe('Users/Show')
  })
})

describe('clearing the history keys from a stack', () => {
  const initWith = (page: Page) =>
    currentPage.init({
      initialPage: page,
      resolveComponent: (name) => ({ name }) as never,
      swapComponent: async () => {},
    })

  const seedKeys = () => {
    window.sessionStorage.setItem(historySessionStorageKeys.key, '[1,2,3]')
    window.sessionStorage.setItem(historySessionStorageKeys.iv, '[4,5,6]')
  }

  const keysHeld = () => window.sessionStorage.getItem(historySessionStorageKeys.key) !== null

  const openOver = (base: Page, layer: Page, id = 'layer-1') =>
    currentPage.set(composeLayer(base, layer, id), { preservesBase: true })

  it('discards them when the layer asks to clear history', async () => {
    initWith(pageWith())
    seedKeys()

    await openOver(currentPage.get(), editLayer({ clearHistory: true }))

    expect(keysHeld()).toBe(false)
  })

  it('keeps them when neither the base nor the layer asks', async () => {
    initWith(pageWith())
    seedKeys()

    await openOver(currentPage.get(), editLayer())

    expect(keysHeld()).toBe(true)
  })

  it('does not discard them again when a second layer opens over one that asked', async () => {
    initWith(pageWith())
    await openOver(currentPage.get(), editLayer({ clearHistory: true }))
    seedKeys()

    await openOver(
      currentPage.get(),
      pageWith({ component: 'Teams/Show', url: '/teams/9', layer: { key: 'Teams/Show' } }),
      'layer-2',
    )

    expect(keysHeld()).toBe(true)
  })

  it('does not discard them again when the page beneath a layer that asked is rewritten', async () => {
    initWith(pageWith())
    await openOver(currentPage.get(), editLayer({ clearHistory: true }))
    seedKeys()

    await new Promise<void>((resolve) => {
      new Router().replace({ props: { users: [{ id: 1 }] }, onSuccess: () => resolve() })
    })

    expect(keysHeld()).toBe(true)
  })
})

describe('the address the events report', () => {
  const initWith = (page: Page) =>
    currentPage.init({
      initialPage: page,
      resolveComponent: (name) => ({ name }) as never,
      swapComponent: async () => {},
    })

  const recordEvents = (): CustomEvent[] => {
    const fired: CustomEvent[] = []

    vi.spyOn(document, 'dispatchEvent').mockImplementation((event) => {
      fired.push(event as CustomEvent)
      return true
    })

    return fired
  }

  const detailOf = (fired: CustomEvent[], name: string) =>
    fired.findLast((event) => event.type === `inertia:${name}`)!.detail

  const visitAnswering = (response: Page): Promise<void> => {
    http.setClient({
      request: async () => ({ status: 200, data: response as unknown as string, headers: { 'x-inertia': 'true' } }),
    })

    return new Promise((resolve) => {
      new Router().visit(`http://localhost${response.url}`, { onSuccess: () => resolve() })
    })
  }

  beforeEach(() => {
    prefetchedRequests.removeAll()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("gives inertia:navigate the layer's address, while the page it carries keeps its own url", async () => {
    initWith(pageWith())
    const fired = recordEvents()

    const layer = pageWith({ component: 'Users/Edit', url: '/users/5/edit', layer: { key: 'Users/Edit' } })

    await currentPage.set(composeLayer(currentPage.get(), layer, 'layer-1'), { preservesBase: true })

    expect(detailOf(fired, 'navigate').url).toBe('/users/5/edit')
    expect(detailOf(fired, 'navigate').page.url).toBe('/users')
  })

  it("gives inertia:navigate the page's own url when there are no layers", async () => {
    initWith(pageWith())
    const fired = recordEvents()

    await currentPage.set(pageWith({ component: 'Users/Show', url: '/users/5' }))

    expect(detailOf(fired, 'navigate').url).toBe('/users/5')
  })

  it("gives inertia:success the layer's address, while the page it carries keeps its own url", async () => {
    initWith(pageWith())
    await currentPage.setQuietly(pageWith())
    const fired = recordEvents()

    await visitAnswering(pageWith({ component: 'Users/Edit', url: '/users/5/edit', layer: { key: 'Users/Edit' } }))

    expect(detailOf(fired, 'success').url).toBe('/users/5/edit')
    expect(detailOf(fired, 'success').page.url).toBe('/users')
  })

  it("gives inertia:success the page's own url when there are no layers", async () => {
    initWith(pageWith())
    await currentPage.setQuietly(pageWith())
    const fired = recordEvents()

    await visitAnswering(pageWith({ component: 'Users/Show', url: '/users/5' }))

    expect(detailOf(fired, 'success').url).toBe('/users/5')
  })
})
