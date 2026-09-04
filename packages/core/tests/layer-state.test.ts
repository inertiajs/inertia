import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { router } from '../src'
import { eventHandler } from '../src/eventHandler'
import { history } from '../src/history'
import { http } from '../src/http'
import { useInfiniteScrollQueryString } from '../src/infiniteScroll/queryString'
import { layerClosing } from '../src/layers'
import { composeLayer, closeLayer, layerPageOf } from '../src/layers'
import { page as currentPage } from '../src/page'
import { prefetchedRequests } from '../src/prefetched'
import { Response } from '../src/response'
import { Router } from '../src/router'
import { ClientSideVisitOptions, HttpResponse, LayerState, Page, ResolvedLayer, VisitOptions } from '../src/types'
import { listeners } from './support/browser'
import { editLayer, hold, pageWith } from './support/layers'

describe("a layer's deferred and rescued props", () => {
  const inertiaResponse = (page: Page): HttpResponse => ({
    status: 200,
    data: page as unknown as string,
    headers: { 'x-inertia': 'true' },
  })

  const queueSettled = () => new Promise((resolve) => setTimeout(resolve))

  let deferredCleanup: (() => void) | null = null

  const deferredRouter = (): Router => {
    deferredCleanup?.()
    const router = new Router()

    deferredCleanup = eventHandler.on(
      'loadDeferredProps',
      ({ deferredProps, layerId }: { deferredProps: Page['deferredProps']; layerId?: string }) => {
        Object.values(deferredProps ?? {}).forEach((props) => {
          router.reload({
            only: props,
            deferredProps: true,
            preserveErrors: true,
            ...(layerId && { layerId }),
          } as VisitOptions)
        })
      },
    )

    return router
  }

  afterEach(async () => {
    deferredCleanup?.()
    deferredCleanup = null
    await queueSettled()
    vi.restoreAllMocks()
  })

  it('loads the deferred props a layer response declared into the layer', async () => {
    await hold(pageWith())
    const requested: { url: string; partialComponent: string | undefined }[] = []

    http.setClient({
      request: ({ url, headers }) => {
        requested.push({
          url: new URL(url).pathname,
          partialComponent: (headers ?? {})['X-Inertia-Partial-Component'],
        })

        return requested.length === 1
          ? Promise.resolve(
              inertiaResponse(
                editLayer({ deferredProps: { slow: ['stats'] }, rescuedProps: ['stats'], props: { user: { id: 5 } } }),
              ),
            )
          : Promise.resolve(
              inertiaResponse(editLayer({ props: { user: { id: 5 }, stats: [1, 2, 3] }, rescuedProps: [] })),
            )
      },
    })

    await new Promise<void>((resolve) => {
      deferredRouter().visit('http://localhost/users/5/edit', { onSuccess: () => resolve(), onError: () => resolve() })
    })
    await vi.waitFor(() => expect(requested).toHaveLength(2))

    expect(requested[1].url).toBe('/users/5/edit')
    expect(requested[1].partialComponent).toBe('Users/Edit')

    await vi.waitFor(() =>
      expect(currentPage.get().layers![0].props).toEqual(expect.objectContaining({ stats: [1, 2, 3] })),
    )
    expect(currentPage.get().layers![0].rescuedProps).toEqual([])
    expect(currentPage.get().props).toEqual({ users: [] })
  })

  it('aims the deferred follow-up at a layer that preserved the url, not at the page', async () => {
    await hold(pageWith())
    const followUps: { url: string; component: string | undefined }[] = []

    http.setClient({
      request: ({ url, headers }) => {
        const path = new URL(url).pathname

        if (((headers ?? {})['X-Inertia-Partial-Data'] ?? '').includes('stats')) {
          followUps.push({ url: path, component: (headers ?? {})['X-Inertia-Partial-Component'] })

          return Promise.resolve(inertiaResponse(editLayer({ props: { user: { id: 5 }, stats: [1] } })))
        }

        return Promise.resolve(
          inertiaResponse(editLayer({ deferredProps: { slow: ['stats'] }, props: { user: { id: 5 } } })),
        )
      },
    })

    await new Promise<void>((resolve) => {
      deferredRouter().visit('http://localhost/users/5/edit', {
        preserveUrl: true,
        onSuccess: () => resolve(),
        onError: () => resolve(),
      })
    })
    await queueSettled()

    expect(currentPage.get().layers![0].preservesUrl).toBe(true)
    expect(followUps).toEqual([{ url: '/users/5/edit', component: 'Users/Edit' }])
    expect(currentPage.get().props).toEqual({ users: [] })
  })

  it("does not re-fire the page's pending deferred props when a layer opens over it", async () => {
    await hold(pageWith())
    const deferredFollowUps: string[] = []

    http.setClient({
      request: ({ url, headers }) => {
        const path = new URL(url).pathname
        const partialData = (headers ?? {})['X-Inertia-Partial-Data'] ?? ''

        if (partialData.includes('stats')) {
          deferredFollowUps.push(path)
          return new Promise<HttpResponse>(() => {})
        }

        return path === '/users/5/edit'
          ? Promise.resolve(
              inertiaResponse(
                editLayer({ deferredProps: { slow: ['stats'] }, rescuedProps: ['stats'], props: { user: { id: 5 } } }),
              ),
            )
          : Promise.resolve(inertiaResponse(pageWith({ deferredProps: { slow: ['stats'] } })))
      },
    })

    const router = deferredRouter()

    await new Promise<void>((resolve) => {
      router.visit('http://localhost/users', { onSuccess: () => resolve(), onError: () => resolve() })
    })
    await queueSettled()
    await vi.waitFor(() => expect(deferredFollowUps).toHaveLength(1))

    await new Promise<void>((resolve) => {
      router.visit('http://localhost/users/5/edit', { onSuccess: () => resolve(), onError: () => resolve() })
    })
    await vi.waitFor(() => expect(deferredFollowUps).toHaveLength(2))

    expect(deferredFollowUps).toEqual(['/users', '/users/5/edit'])
  })

  it('rescued props travel with the layer and resolve into its props', async () => {
    await hold(pageWith())
    const held: ((response: HttpResponse) => void)[] = []
    let opens = 0

    http.setClient({
      request: ({ url }) => {
        const path = new URL(url).pathname
        return path === '/users/5/edit' && opens++ === 0
          ? Promise.resolve(
              inertiaResponse(
                editLayer({
                  deferredProps: { slow: ['stats'] },
                  rescuedProps: ['stats', 'notes'],
                  props: { user: { id: 5 } },
                }),
              ),
            )
          : new Promise<HttpResponse>((resolve) => held.push(resolve))
      },
    })

    await new Promise<void>((resolve) => {
      deferredRouter().visit('http://localhost/users/5/edit', { onSuccess: () => resolve(), onError: () => resolve() })
    })

    expect(currentPage.get().layers![0].rescuedProps).toEqual(['stats', 'notes'])
    expect(layerPageOf(currentPage.get(), currentPage.get().layers![0]).rescuedProps).toEqual(['stats', 'notes'])

    await vi.waitFor(() => expect(held).toHaveLength(1))
    await queueSettled()
    held[0](inertiaResponse(editLayer({ props: { user: { id: 5 }, stats: [1, 2, 3] }, rescuedProps: [] })))
    await vi.waitFor(() =>
      expect(currentPage.get().layers![0].props).toEqual(expect.objectContaining({ stats: [1, 2, 3] })),
    )

    expect(currentPage.get().layers![0].rescuedProps).toEqual(['notes'])
    expect(currentPage.get().props).toEqual({ users: [] })
  })

  it('drops what a layer was owing when the write that lands has closed it', async () => {
    await hold(pageWith())
    const groups: { layerId?: string }[] = []
    const stop = eventHandler.on('loadDeferredProps', (payload: { layerId?: string }) => groups.push(payload))

    const opened = composeLayer(pageWith(), editLayer({ deferredProps: { slow: ['stats'] } }), 'layer-1')

    currentPage.set(opened)
    await currentPage.set(closeLayer(opened, 'layer-1'))

    stop()

    expect(groups).toEqual([])
  })

  it("re-asks for the deferred props a restored entry's layer is still missing", async () => {
    eventHandler.init()
    await hold(pageWith())

    const asked: { only: unknown; partialComponent: string | undefined }[] = []
    http.setClient({
      request: ({ headers }) => {
        asked.push({
          only: headers['X-Inertia-Partial-Data'],
          partialComponent: headers['X-Inertia-Partial-Component'],
        })

        return new Promise<HttpResponse>(() => {})
      },
    })

    deferredRouter()

    const entry = composeLayer(
      pageWith({ deferredProps: { slow: ['sidebar'] }, props: { users: [], sidebar: ['loaded'] } }),
      editLayer({ deferredProps: { slow: ['stats'] }, props: { user: { id: 5 } } }),
      'layer-1',
    )

    listeners.get('popstate')!({ state: { page: entry } } as unknown as Event)

    await vi.waitFor(() => expect(asked).toHaveLength(1))
    await queueSettled()

    expect(asked).toEqual([{ only: 'stats', partialComponent: 'Users/Edit' }])
  })
})

describe('the deferred props a page write was carrying', () => {
  const listen = (): { groups: Page['deferredProps'][]; stop: () => void } => {
    const groups: Page['deferredProps'][] = []
    const stop = eventHandler.on('loadDeferredProps', (payload: { deferredProps: Page['deferredProps'] }) =>
      groups.push(payload.deferredProps),
    )

    return { groups, stop }
  }

  it('are announced by the write that lands when a newer one supersedes it', async () => {
    await hold(pageWith())
    const { groups, stop } = listen()

    currentPage.set(pageWith({ deferredProps: { default: ['stats'] } }))
    await currentPage.set(pageWith({ props: { users: [], stats: [] } }))

    stop()

    expect(groups).toEqual([{ default: ['stats'] }])
  })

  it('are dropped when the write that lands is on another page entirely', async () => {
    await hold(pageWith())
    const { groups, stop } = listen()

    currentPage.set(pageWith({ deferredProps: { default: ['stats'] } }))
    await currentPage.set(pageWith({ component: 'Teams/Index', url: '/teams' }))

    stop()

    expect(groups).toEqual([])
  })

  it('are announced again by a cached prefetch replayed onto the page a second time', async () => {
    await hold(pageWith())
    const { groups, stop } = listen()

    const deferred = pageWith({ component: 'Users/Show', url: '/users/5', deferredProps: { default: ['stats'] } })
    let requests = 0

    http.setClient({
      request: async ({ url }) => {
        requests++

        return {
          status: 200,
          data: (url.includes('/users/5') ? deferred : pageWith()) as unknown as string,
          headers: { 'x-inertia': 'true' },
        }
      },
    })

    const router = new Router()
    router.prefetch('http://localhost/users/5', {}, { cacheFor: '30s' })
    await vi.waitFor(() => expect(requests).toBe(1))

    const visit = (url: string) =>
      new Promise<void>((resolve) => router.visit(url, { onSuccess: () => resolve(), onError: () => resolve() }))

    await visit('http://localhost/users/5')
    await visit('http://localhost/users')
    await visit('http://localhost/users/5')

    stop()
    prefetchedRequests.removeAll()

    expect(groups).toEqual([{ default: ['stats'] }, { default: ['stats'] }])
  })

  it('are left alone by a write that carries them along for another tier', async () => {
    await hold(pageWith())
    const { groups, stop } = listen()

    await currentPage.set(pageWith({ deferredProps: { default: ['stats'] } }))
    await currentPage.set(composeLayer(currentPage.get(), editLayer(), 'layer-1'))

    stop()

    expect(groups).toEqual([{ default: ['stats'] }])
  })
})

describe("a layer response's errors", () => {
  const inertiaResponse = (page: Page): HttpResponse => ({
    status: 200,
    data: page as unknown as string,
    headers: { 'x-inertia': 'true' },
  })

  const queueSettled = () => new Promise((resolve) => setTimeout(resolve))

  afterEach(async () => {
    await queueSettled()
    vi.restoreAllMocks()
  })

  it("announces a layer response's errors through the layer's bag, not the page's", async () => {
    await hold(pageWith())
    const events: string[] = []
    let announcedErrors: unknown

    http.setClient({
      request: async () =>
        inertiaResponse(editLayer({ props: { user: { id: 5 }, errors: { note: 'The note is required.' } } })),
    })

    await new Promise<void>((resolve) => {
      new Router().visit('http://localhost/users/5/edit', {
        onError: (errors) => {
          announcedErrors = errors
          events.push('error')
        },
        onSuccess: () => events.push('success'),
        onFinish: () => resolve(),
      })
    })

    expect(events).toEqual(['error'])
    expect(announcedErrors).toEqual({ note: 'The note is required.' })
    expect(currentPage.get().layers![0].props.errors).toEqual({ note: 'The note is required.' })
  })

  it('announces the errors a rewrite of an open layer brings through that layer', async () => {
    await hold(pageWith())
    http.setClient({ request: async () => inertiaResponse(editLayer()) })
    await new Promise<void>((resolve) => {
      new Router().visit('http://localhost/users/5/edit', { onSuccess: () => resolve(), onError: () => resolve() })
    })
    await queueSettled()
    const layerId = currentPage.get().layers![0].id

    let announcedErrors: unknown
    let success = false
    http.setClient({
      request: async () =>
        inertiaResponse(editLayer({ props: { user: { id: 5 }, errors: { note: 'The note is required.' } } })),
    })

    await new Promise<void>((resolve) => {
      new Router().visit('http://localhost/users', {
        method: 'post',
        onError: (errors) => {
          announcedErrors = errors
          resolve()
        },
        onSuccess: () => {
          success = true
          resolve()
        },
      })
    })

    expect(announcedErrors).toEqual({ note: 'The note is required.' })
    expect(success).toBe(false)
    expect(currentPage.get().layers![0].id).toBe(layerId)
  })

  it('announces a rewrite of a non-top layer through that layer, not the top', async () => {
    await hold(pageWith())
    http.setClient({
      request: async () => inertiaResponse(editLayer()),
    })
    await new Promise<void>((resolve) => {
      new Router().visit('http://localhost/users/5/edit', { onSuccess: () => resolve(), onError: () => resolve() })
    })
    await queueSettled()
    http.setClient({
      request: async () =>
        inertiaResponse(
          pageWith({
            component: 'Teams/Show',
            url: '/teams/9',
            layer: { key: 'Teams/Show' },
            props: { team: { id: 9 } },
          }),
        ),
    })
    await new Promise<void>((resolve) => {
      new Router().visit('http://localhost/teams/9', { onSuccess: () => resolve(), onError: () => resolve() })
    })
    await queueSettled()

    const beneath = currentPage.get().layers![0]
    const top = currentPage.get().layers![1]

    let announcedErrors: unknown
    let success = false
    http.setClient({
      request: async () =>
        inertiaResponse(editLayer({ props: { user: { id: 5 }, errors: { note: 'The note is required.' } } })),
    })

    await new Promise<void>((resolve) => {
      new Router().visit('http://localhost/users', {
        method: 'post',
        onError: (errors) => {
          announcedErrors = errors
          resolve()
        },
        onSuccess: () => {
          success = true
          resolve()
        },
      })
    })

    expect(announcedErrors).toEqual({ note: 'The note is required.' })
    expect(success).toBe(false)
    expect(currentPage.get().layers!.map((layer) => layer.id)).toEqual([beneath.id])
    expect(currentPage.get().layers![0].props).toHaveProperty('errors')
    expect(top.props).not.toHaveProperty('errors')
  })

  it("a page response's errors announce exactly as they always have", async () => {
    await hold(pageWith())
    const events: string[] = []
    let announcedErrors: unknown

    http.setClient({
      request: async () =>
        inertiaResponse(pageWith({ props: { users: [], errors: { name: 'The name is required.' } } })),
    })

    await new Promise<void>((resolve) => {
      new Router().visit('http://localhost/users', {
        onError: (errors) => {
          announcedErrors = errors
          events.push('error')
        },
        onSuccess: () => events.push('success'),
        onFinish: () => resolve(),
      })
    })

    expect(events).toEqual(['error'])
    expect(announcedErrors).toEqual({ name: 'The name is required.' })
  })
})

describe("a layer response's flash", () => {
  const inertiaResponse = (page: Page): HttpResponse => ({
    status: 200,
    data: page as unknown as string,
    headers: { 'x-inertia': 'true' },
  })

  const hold = async (page: Page, onFlash?: (flash: Page['flash']) => void): Promise<Page> => {
    currentPage.init({
      initialPage: page,
      resolveComponent: (name) => ({ name }) as never,
      swapComponent: async () => {},
      ...(onFlash && { onFlash }),
    })

    await currentPage.setQuietly(page)

    return page
  }

  const queueSettled = () => new Promise((resolve) => setTimeout(resolve))

  let deferredCleanup: (() => void) | null = null

  const deferredRouter = (): Router => {
    deferredCleanup?.()
    const router = new Router()

    deferredCleanup = eventHandler.on(
      'loadDeferredProps',
      (payload: { deferredProps: Page['deferredProps']; layerId?: string }) => {
        Object.values(payload.deferredProps ?? {}).forEach((props) => {
          router.reload({
            only: props,
            deferredProps: true,
            preserveErrors: true,
            ...(payload.layerId && { layerId: payload.layerId }),
          } as VisitOptions)
        })
      },
    )

    return router
  }

  afterEach(async () => {
    deferredCleanup?.()
    deferredCleanup = null
    await queueSettled()
    vi.restoreAllMocks()
  })

  it("announces a layer response's flash through the layer, whose own page carries it", async () => {
    await hold(pageWith())
    let announcedFlash: unknown

    http.setClient({
      request: async () => inertiaResponse(editLayer({ flash: { message: 'Saved.' } })),
    })

    await new Promise<void>((resolve) => {
      new Router().visit('http://localhost/users/5/edit', {
        onFlash: (flash) => {
          announcedFlash = flash
          resolve()
        },
        onSuccess: () => resolve(),
      })
    })

    expect(announcedFlash).toEqual({ message: 'Saved.' })
    expect(layerPageOf(currentPage.get(), currentPage.get().layers![0]).flash).toEqual({ message: 'Saved.' })
    expect(currentPage.get().flash).toEqual({})
  })

  it("strips a layer's flash from the history entry it leaves", async () => {
    await hold(pageWith())
    const pushState = vi.spyOn(window.history, 'pushState')

    http.setClient({
      request: async () => inertiaResponse(editLayer({ flash: { message: 'Saved.' } })),
    })

    await new Promise<void>((resolve) => {
      new Router().visit('http://localhost/users/5/edit', { onSuccess: () => resolve(), onError: () => resolve() })
    })

    const [state] = pushState.mock.lastCall as unknown as [{ page: Page }]
    const entryLayer = state.page.layers![0]

    expect((entryLayer as LayerState).flash).toEqual({})
  })

  it("a layer's live flash survives a history merge that does not touch it", async () => {
    await hold(pageWith())
    http.setClient({ request: async () => inertiaResponse(editLayer({ flash: { message: 'Saved.' } })) })
    await new Promise<void>((resolve) => {
      new Router().visit('http://localhost/users/5/edit', { onSuccess: () => resolve(), onError: () => resolve() })
    })
    await queueSettled()

    router.remember('note', 'typed')

    expect(currentPage.get().layers![0].flash).toEqual({ message: 'Saved.' })
  })

  it("router.flash with no layer open fires onFlash with the page's flash", async () => {
    const baseFlashes: unknown[] = []
    await hold(pageWith(), (flash) => baseFlashes.push(flash))

    router.flash('message', 'Saved.')

    expect(currentPage.get().flash).toEqual({ message: 'Saved.' })
    expect(baseFlashes).toEqual([{ message: 'Saved.' }])
  })

  it("a flash written to a layer never reaches the page's own flash", async () => {
    const baseFlashes: unknown[] = []
    await hold(pageWith(), (flash) => baseFlashes.push(flash))
    http.setClient({ request: async () => inertiaResponse(editLayer()) })
    await new Promise<void>((resolve) => {
      new Router().visit('http://localhost/users/5/edit', { onSuccess: () => resolve(), onError: () => resolve() })
    })
    await queueSettled()

    router.flash('message', 'Saved.', { layerId: currentPage.get().layers![0].id })

    expect(currentPage.get().layers![0].flash).toEqual({ message: 'Saved.' })
    expect(baseFlashes).toEqual([])
  })

  it('re-renders the layer a flash was written to, since no callback carries it', async () => {
    const swapped: (ResolvedLayer[] | undefined)[] = []

    currentPage.init({
      initialPage: pageWith(),
      resolveComponent: (name) => ({ name }) as never,
      swapComponent: async ({ layers }) => {
        swapped.push(layers)
      },
    })
    await currentPage.setQuietly(composeLayer(pageWith(), editLayer(), 'layer-1'))
    swapped.length = 0

    router.flash('message', 'Saved.', { layerId: 'layer-1' })

    await vi.waitFor(() => expect(swapped).toHaveLength(1))
    expect(swapped[0]![0].page.flash).toEqual({ message: 'Saved.' })
  })

  it("router.flash from inside a layer targets the layer's flash", async () => {
    await hold(pageWith())
    http.setClient({ request: async () => inertiaResponse(editLayer()) })
    await new Promise<void>((resolve) => {
      new Router().visit('http://localhost/users/5/edit', { onSuccess: () => resolve(), onError: () => resolve() })
    })
    await queueSettled()
    const layerId = currentPage.get().layers![0].id

    router.flash('message', 'Saved.', { layerId })

    expect(currentPage.get().layers![0].flash).toEqual({ message: 'Saved.' })
    expect(currentPage.get().flash).toEqual({})
  })

  it("a layer's deferred response keeps the flash the layer already had", async () => {
    await hold(pageWith())
    const held: ((response: HttpResponse) => void)[] = []
    let opens = 0

    http.setClient({
      request: ({ url }) => {
        const path = new URL(url).pathname
        return path === '/users/5/edit' && opens++ === 0
          ? Promise.resolve(
              inertiaResponse(
                editLayer({
                  flash: { message: 'Saved.' },
                  deferredProps: { slow: ['stats'] },
                  rescuedProps: ['stats'],
                  props: { user: { id: 5 } },
                }),
              ),
            )
          : new Promise<HttpResponse>((resolve) => held.push(resolve))
      },
    })

    await new Promise<void>((resolve) => {
      deferredRouter().visit('http://localhost/users/5/edit', { onSuccess: () => resolve(), onError: () => resolve() })
    })

    await vi.waitFor(() => expect(held).toHaveLength(1))
    await queueSettled()
    held[0](inertiaResponse(editLayer({ props: { user: { id: 5 }, stats: [1, 2, 3] }, rescuedProps: [] })))
    await vi.waitFor(() =>
      expect(currentPage.get().layers![0].props).toEqual(expect.objectContaining({ stats: [1, 2, 3] })),
    )

    expect(currentPage.get().layers![0].flash).toEqual({ message: 'Saved.' })
  })
})

describe('remembered state per layer', () => {
  const inertiaResponse = (page: Page): HttpResponse => ({
    status: 200,
    data: page as unknown as string,
    headers: { 'x-inertia': 'true' },
  })

  const queueSettled = () => new Promise((resolve) => setTimeout(resolve))

  const openLayer = async (preserveUrl = false): Promise<string> => {
    http.setClient({ request: async () => inertiaResponse(editLayer()) })
    await new Promise<void>((resolve) => {
      new Router().visit('http://localhost/users/5/edit', {
        ...(preserveUrl && { preserveUrl: true }),
        onSuccess: () => resolve(),
        onError: () => resolve(),
      })
    })
    await queueSettled()
    return currentPage.get().layers![0].id
  }

  afterEach(async () => {
    await queueSettled()
    vi.restoreAllMocks()
  })

  it("namespaces a layer's remember/restore under its id, leaving the page's bag alone", async () => {
    await hold(pageWith())
    const layerId = await openLayer()

    router.remember('typed', 'note', layerId)

    expect(history.restore('note', layerId)).toBe('typed')
    expect(history.restore('note')).toBeUndefined()
    expect(currentPage.get().rememberedState).toEqual({ [layerId]: { note: 'typed' } })
  })

  it('a remember/restore with no layer open keeps the top-level bag it always used', async () => {
    await hold(pageWith())

    router.remember('typed', 'note')

    expect(history.restore('note')).toBe('typed')
    expect(currentPage.get().rememberedState).toEqual({ note: 'typed' })
  })

  it("drops a closed layer's bag once its removal has settled", async () => {
    await hold(pageWith())
    const layerId = await openLayer(true)

    router.remember('typed', 'note', layerId)
    expect(history.restore('note', layerId)).toBe('typed')

    await layerClosing.close(layerId)
    await history.processQueue()

    eventHandler.init()
    listeners.get('popstate')!({ state: { page: pageWith() } } as PopStateEvent)

    await vi.waitFor(() => expect(currentPage.get().rememberedState).toEqual({}))
    expect(router.restore('note', layerId)).toBeUndefined()
  })

  it("a restored page keeps the layer's bag, so reopening it finds the state", async () => {
    const layerId = 'layer-1'
    const restored = pageWith({
      layers: [editLayer() as unknown as Page['layers'] extends Array<infer L> ? L : never],
      rememberedState: { [layerId]: { note: 'typed' } },
    })

    currentPage.init({
      initialPage: restored,
      resolveComponent: (name) => ({ name }) as never,
      swapComponent: async () => {},
    })
    await currentPage.setQuietly(restored)

    expect(history.restore('note', layerId)).toBe('typed')
  })
})

describe('once props per layer', () => {
  const inertiaResponse = (page: Page): HttpResponse => ({
    status: 200,
    data: page as unknown as string,
    headers: { 'x-inertia': 'true' },
  })

  const queueSettled = () => new Promise((resolve) => setTimeout(resolve))

  const cached = () => (prefetchedRequests as unknown as { cached: unknown[] }).cached

  afterEach(async () => {
    await queueSettled()
    prefetchedRequests.removeAll()
    vi.restoreAllMocks()
  })

  it('names no once keys at all on the visit that opens a layer', async () => {
    await hold(pageWith({ props: { baseProp: 'base value' }, onceProps: { baseKey: { prop: 'baseProp' } } }))

    let exceptOnce: string | undefined = 'unset'
    http.setClient({
      request: async ({ headers }) => {
        exceptOnce = (headers ?? {})['X-Inertia-Except-Once-Props']

        return Promise.resolve(inertiaResponse(editLayer()))
      },
    })

    router.layer('http://localhost/users/5/edit')
    await vi.waitFor(() => expect(currentPage.get().layers).toHaveLength(1))

    expect(exceptOnce).toBeUndefined()
  })

  it("a layer-targeted partial names the layer's once keys in the except header", async () => {
    await hold(pageWith({ props: { baseProp: 'base value' }, onceProps: { baseKey: { prop: 'baseProp' } } }))
    http.setClient({
      request: async () =>
        inertiaResponse(
          editLayer({
            onceProps: { layerKey: { prop: 'layerProp' } },
            props: { user: { id: 5 }, layerProp: 'layer value' },
          }),
        ),
    })
    await new Promise<void>((resolve) => {
      new Router().visit('http://localhost/users/5/edit', { onSuccess: () => resolve(), onError: () => resolve() })
    })
    await queueSettled()

    let exceptOnce: string | undefined
    http.setClient({
      request: async ({ headers }) => {
        exceptOnce = (headers ?? {})['X-Inertia-Except-Once-Props']
        return Promise.resolve(inertiaResponse(editLayer({ props: { user: { id: 5 } } })))
      },
    })

    await new Promise<void>((resolve) => {
      new Router().reload({
        layerId: currentPage.get().layers![0].id,
        only: ['user'],
        onSuccess: () => resolve(),
        onError: () => resolve(),
      })
    })

    expect(exceptOnce).toBe('layerKey')
  })

  it("a layer response's once props back-fill into the layer, never with the page's value", async () => {
    await hold(pageWith({ props: { baseProp: 'base value' }, onceProps: { baseKey: { prop: 'baseProp' } } }))
    http.setClient({
      request: async () =>
        inertiaResponse(
          editLayer({
            onceProps: { layerKey: { prop: 'layerProp' } },
            props: { user: { id: 5 }, layerProp: 'layer value' },
          }),
        ),
    })
    await new Promise<void>((resolve) => {
      new Router().visit('http://localhost/users/5/edit', { onSuccess: () => resolve(), onError: () => resolve() })
    })
    await queueSettled()
    const layerId = currentPage.get().layers![0].id

    http.setClient({
      request: async () =>
        inertiaResponse(editLayer({ onceProps: { layerKey: { prop: 'layerProp' } }, props: { user: { id: 9 } } })),
    })
    await new Promise<void>((resolve) => {
      new Router().visit('http://localhost/users/5/edit', { onSuccess: () => resolve(), onError: () => resolve() })
    })

    expect(currentPage.get().layers![0].props).toEqual(
      expect.objectContaining({ user: { id: 9 }, layerProp: 'layer value' }),
    )
    expect(currentPage.get().layers![0].props).not.toHaveProperty('baseProp')
  })

  it("does not put the page's once props into a cached layer response", async () => {
    await hold(pageWith({ props: { baseProp: 'base value' }, onceProps: { baseKey: { prop: 'baseProp' } } }))
    http.setClient({
      request: async () =>
        inertiaResponse(editLayer({ onceProps: { baseKey: { prop: 'baseProp' } }, props: { user: { id: 5 } } })),
    })

    new Router().prefetch('http://localhost/users/5/edit', {}, { cacheFor: '30s' })
    await vi.waitFor(() => expect(cached()).toHaveLength(1))

    prefetchedRequests.updateCachedOncePropsFromCurrentPage()

    const [prefetched] = cached() as unknown as [{ response: Promise<Response> }]
    const page = await prefetched.response.then((response) => response.getPageResponse())

    expect(page.props).not.toHaveProperty('baseProp')
  })

  it("re-syncs a cached prefetch when the once props on screen are only a layer's", async () => {
    await hold(pageWith())
    http.setClient({
      request: async () =>
        inertiaResponse(editLayer({ url: '/users/5/notes', onceProps: { token: { prop: 'token' } } })),
    })

    new Router().prefetch('http://localhost/users/5/notes', {}, { cacheFor: '30s' })
    await vi.waitFor(() => expect(cached()).toHaveLength(1))

    http.setClient({
      request: async () =>
        inertiaResponse(
          editLayer({ onceProps: { token: { prop: 'token' } }, props: { user: { id: 5 }, token: 'live' } }),
        ),
    })
    await new Promise<void>((resolve) => {
      new Router().visit('http://localhost/users/5/edit', { onSuccess: () => resolve(), onError: () => resolve() })
    })

    const [prefetched] = cached() as unknown as [{ response: Promise<Response> }]
    const page = await prefetched.response.then((response) => response.getPageResponse())

    expect(page.props.token).toBe('live')
  })

  it('flushes the cached prefetch of the layer a fresh response landed on', async () => {
    await hold(pageWith())
    http.setClient({ request: async () => inertiaResponse(editLayer()) })
    await new Promise<void>((resolve) => {
      new Router().visit('http://localhost/users/5/edit', { onSuccess: () => resolve(), onError: () => resolve() })
    })

    new Router().prefetch('http://localhost/users/5/edit', {}, { cacheFor: '30s' })
    await vi.waitFor(() => expect(cached()).toHaveLength(1))

    http.setClient({ request: async () => inertiaResponse(editLayer({ props: { user: { id: 9 } } })) })
    await new Promise<void>((resolve) => {
      new Router().visit('http://localhost/users/5/edit', {
        method: 'post',
        onSuccess: () => resolve(),
        onError: () => resolve(),
      })
    })

    expect(cached()).toHaveLength(0)
  })
})

describe("an infinite scroll's url sync", () => {
  const item = (page: string): HTMLElement =>
    ({
      dataset: { infiniteScrollPage: page },
      offsetParent: {},
      getBoundingClientRect: () => ({ top: 0, bottom: 10, left: 0, right: 10 }),
    }) as unknown as HTMLElement

  const paginate = async (layerId: string | undefined): Promise<ClientSideVisitOptions[]> => {
    const replaced: ClientSideVisitOptions[] = []
    vi.spyOn(Router.prototype, 'replace').mockImplementation((params) => {
      replaced.push(params as ClientSideVisitOptions)
    })

    const items = [item('2'), item('2')]
    const manager = useInfiniteScrollQueryString({
      layerId,
      getPageName: () => 'page',
      getItemsElement: () => ({ children: items }) as unknown as HTMLElement,
      shouldPreserveUrl: () => false,
    })

    manager.onItemIntersected(items[1])
    await vi.waitFor(() => expect(replaced).toHaveLength(1))

    return replaced
  }

  beforeEach(() => {
    Object.assign(window, { innerHeight: 800, innerWidth: 800 })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("writes the page number onto the layer's own url, and aims the visit at the layer", async () => {
    await hold(composeLayer(pageWith(), editLayer(), 'layer-1', { url: '/users/5/edit' }))

    expect(await paginate('layer-1')).toEqual([
      { url: '/users/5/edit?page=2', layerId: 'layer-1', preserveScroll: true, preserveState: true },
    ])
  })

  it("writes the page number onto the page's own url when the scroll is not in a layer", async () => {
    await hold(composeLayer(pageWith(), editLayer(), 'layer-1', { url: '/users/5/edit' }))

    expect(await paginate(undefined)).toEqual([
      { url: '/users?page=2', layerId: undefined, preserveScroll: true, preserveState: true },
    ])
  })

  it("keeps a layer and the page paginating at once out of each other's urls", async () => {
    await hold(composeLayer(pageWith(), editLayer(), 'layer-1', { url: '/users/5/edit' }))

    const replaced: ClientSideVisitOptions[] = []
    vi.spyOn(Router.prototype, 'replace').mockImplementation((params) => {
      replaced.push(params as ClientSideVisitOptions)
    })

    const items = [item('2'), item('2')]
    const scrollFor = (layerId?: string) =>
      useInfiniteScrollQueryString({
        layerId,
        getPageName: () => 'page',
        getItemsElement: () => ({ children: items }) as unknown as HTMLElement,
        shouldPreserveUrl: () => false,
      })

    scrollFor(undefined).onItemIntersected(items[1])
    scrollFor('layer-1').onItemIntersected(items[1])

    await vi.waitFor(() => expect(replaced).toHaveLength(2))

    expect(replaced.map((visit) => `${visit.layerId}:${visit.url}`).sort()).toEqual([
      'layer-1:/users/5/edit?page=2',
      'undefined:/users?page=2',
    ])
  })
})
