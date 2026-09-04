import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { router } from '../src'
import { eventHandler } from '../src/eventHandler'
import { history } from '../src/history'
import { http } from '../src/http'
import { layerClosing } from '../src/layers'
import {
  addressOf,
  closeLayer,
  composeColdLayer,
  composeLayer,
  composeLocalLayer,
  entriesToUnwind,
  isLayerResponse,
  layerPageOf,
  nextLayerId,
} from '../src/layers'
import { page as currentPage } from '../src/page'
import { prefetchedRequests } from '../src/prefetched'
import { RequestParams } from '../src/requestParams'
import { Response } from '../src/response'
import { Router } from '../src/router'
import { Scroll } from '../src/scroll'
import {
  ActiveVisit,
  ClientSideVisitOptions,
  Errors,
  HttpResponse,
  LayerState,
  Page,
  PageHandler,
  ResolvedLayer,
  VisitOptions,
} from '../src/types'
import { listeners } from './support/browser'
import { editLayer, hold, holding, pageWith, respondWith } from './support/layers'

describe('resolving a page with layers', () => {
  const swapArgsFor = async (page: Page): Promise<Parameters<PageHandler>[0]> => {
    const swapped: Parameters<PageHandler>[0][] = []

    currentPage.init({
      initialPage: pageWith(),
      resolveComponent: (name) => ({ name }) as never,
      swapComponent: async (args) => {
        swapped.push(args)
      },
    })

    await currentPage.setQuietly(page)

    return swapped.at(-1)!
  }

  it('resolves every layer and hands them to the adapter in stack order', async () => {
    const first = composeLayer(
      pageWith(),
      pageWith({ component: 'Users/Edit', layer: { key: 'Users/Edit' } }),
      'layer-1',
    )
    const composed = composeLayer(first, pageWith({ component: 'Teams/Show', layer: { key: 'Teams/Show' } }), 'layer-2')

    const args = await swapArgsFor(composed)

    expect(args.component).toEqual({ name: 'Users/Index' })
    expect(args.layers).toEqual([
      expect.objectContaining({ id: 'layer-1', component: { name: 'Users/Edit' } }),
      expect.objectContaining({ id: 'layer-2', component: { name: 'Teams/Show' } }),
    ])
  })

  it('keeps the rest of the layer state beside the resolved component', async () => {
    const response = pageWith({
      component: 'Users/Edit',
      props: { user: { id: 5 } },
      url: '/users/5/edit',
      layer: { key: 'Users/Edit', base: '/users' },
    })

    const composed = composeLayer(pageWith(), response, 'layer-1')
    const args = await swapArgsFor(composed)

    expect(args.layers).toEqual([
      {
        ...composed.layers![0],
        component: { name: 'Users/Edit' },
        isClosing: false,
        page: layerPageOf(composed, composed.layers![0]),
      },
    ])
  })

  it('passes no layers for an ordinary page', async () => {
    const args = await swapArgsFor(pageWith({ component: 'Users/Show' }))

    expect(args.component).toEqual({ name: 'Users/Show' })
    expect(args.layers).toBeUndefined()
  })
})

describe('an ordinary response', () => {
  it('is passed through untouched, with no layers key', () => {
    const response = pageWith({ component: 'Users/Show', url: '/users/5' })

    expect(isLayerResponse(response)).toBe(false)
    expect(response).not.toHaveProperty('layers')
  })
})

describe('base generation', () => {
  const initWith = (page: Page) =>
    currentPage.init({
      initialPage: page,
      resolveComponent: (name) => ({ name }) as never,
      swapComponent: async () => {},
    })

  const set = (page: Page, options?: Parameters<typeof currentPage.set>[1]) => currentPage.set(page, options)

  it('changes when a page response replaces the base', async () => {
    initWith(pageWith())
    const before = currentPage.generation()

    await set(pageWith({ component: 'Users/Show', url: '/users/5' }))

    expect(currentPage.generation()).not.toBe(before)
  })

  it('survives a layer composed onto the base', async () => {
    initWith(pageWith())
    const before = currentPage.generation()

    const layer = pageWith({ component: 'Users/Edit', layer: { key: 'Users/Edit' } })

    await set(composeLayer(currentPage.get(), layer, 'layer-1'), { preservesBase: true })

    expect(currentPage.generation()).toBe(before)
  })

  it('changes when a navigation lands on the very same page', async () => {
    initWith(pageWith())
    const before = currentPage.generation()

    await set(pageWith())

    expect(currentPage.generation()).not.toBe(before)
  })

  it('survives a partial reload of the same page', async () => {
    initWith(pageWith())
    const before = currentPage.generation()

    await set(pageWith({ props: { users: [{ id: 1 }] } }), { preservesBase: true })

    expect(currentPage.generation()).toBe(before)
  })

  it('survives a client visit that only rewrites the url', () => {
    initWith(pageWith())
    const before = currentPage.generation()

    new Router().replace({ url: 'http://localhost/users?page=2' })

    expect(currentPage.generation()).toBe(before)
  })

  it('changes when a client visit declares another component', async () => {
    initWith(pageWith())
    const before = currentPage.generation()

    new Router().push({ component: 'Users/Create', url: 'http://localhost/users/create' })
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(currentPage.generation()).not.toBe(before)
  })

  it('changes when a client visit pushes another page state', async () => {
    initWith(pageWith())
    const before = currentPage.generation()

    new Router().push({ url: 'http://localhost/users/2', props: { users: [{ id: 2 }] } })
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(currentPage.generation()).not.toBe(before)
  })

  it('survives the prop helpers rewriting the page in place', () => {
    initWith(pageWith())
    const before = currentPage.generation()
    const router = new Router()

    router.replaceProp('users', [{ id: 1 }])
    expect(currentPage.generation()).toBe(before)

    router.appendToProp('users', { id: 2 })
    expect(currentPage.generation()).toBe(before)

    router.prependToProp('users', { id: 0 })
    expect(currentPage.generation()).toBe(before)
  })

  it('changes when history restores a page', async () => {
    initWith(pageWith())
    const before = currentPage.generation()

    await currentPage.setQuietly(pageWith({ component: 'Users/Show', url: '/users/5' }))

    expect(currentPage.generation()).not.toBe(before)
  })

  it('survives a prop refresh of the base', async () => {
    initWith(pageWith())
    const before = currentPage.generation()

    await currentPage.setPropsQuietly({ ...currentPage.get().props, users: [{ id: 1 }] })

    expect(currentPage.generation()).toBe(before)
  })
})

describe('base id', () => {
  const initWith = (page: Page) =>
    currentPage.init({
      initialPage: page,
      resolveComponent: (name) => ({ name }) as never,
      swapComponent: async () => {},
    })

  const set = (page: Page, options?: Parameters<typeof currentPage.set>[1]) => currentPage.set(page, options)

  it('is created for the base it is given', () => {
    initWith(pageWith())

    expect(currentPage.id()).toBeTruthy()
  })

  it('survives a layer composed onto the base', async () => {
    initWith(pageWith())
    const before = currentPage.id()

    const layer = pageWith({ component: 'Users/Edit', layer: { key: 'Users/Edit' } })

    await set(composeLayer(currentPage.get(), layer, 'layer-1'), { preservesBase: true })

    expect(currentPage.id()).toBe(before)
  })

  it('survives a partial reload of the same page', async () => {
    initWith(pageWith())
    const before = currentPage.id()

    await set(pageWith({ props: { users: [{ id: 1 }] } }), { preservesBase: true })

    expect(currentPage.id()).toBe(before)
  })

  it('survives a plain reload of the same page', async () => {
    initWith(pageWith())
    const before = currentPage.id()

    await set(pageWith({ props: { users: [{ id: 9 }] } }), { preservesBase: true })

    expect(currentPage.id()).toBe(before)
  })

  it('changes when a navigation replaces the base', async () => {
    initWith(pageWith())
    const before = currentPage.id()

    await set(pageWith({ component: 'Users/Show', url: '/users/5' }))

    expect(currentPage.id()).not.toBe(before)
  })

  it('survives a preserved visit to another url of the same component', async () => {
    initWith(pageWith())
    const before = currentPage.id()

    await set(pageWith({ url: '/users?filter=x' }), { preserveState: true })

    expect(currentPage.id()).toBe(before)
  })

  it('changes when a preserved visit installs another component', async () => {
    initWith(pageWith())
    const before = currentPage.id()

    await set(pageWith({ component: 'Users/Show', url: '/users/5' }), { preserveState: true })

    expect(currentPage.id()).not.toBe(before)
  })

  it('survives a partial that moves the base while a layer stands on it', async () => {
    initWith(pageWith())
    const before = currentPage.id()

    await set(composeLayer(currentPage.get(), editLayer(), 'layer-1'), { preservesBase: true })
    await set(composeLayer(pageWith({ url: '/users?search=x' }), editLayer(), 'layer-1'))

    expect(currentPage.id()).toBe(before)
  })

  it('never changes on a history restore', async () => {
    initWith(pageWith())
    const before = currentPage.id()

    await currentPage.setQuietly(pageWith({ component: 'Users/Show', url: '/users/5' }))

    expect(currentPage.id()).toBe(before)
  })
})

describe('an open stack across a client visit', () => {
  const stacked = (): Page =>
    composeLayer(pageWith(), pageWith({ component: 'Users/Edit', layer: { key: 'Users/Edit' } }), 'layer-1')

  const clientVisit = (params: ClientSideVisitOptions, { replace = false } = {}): Promise<Page> => {
    currentPage.init({
      initialPage: stacked(),
      resolveComponent: (name) => ({ name }) as never,
      swapComponent: async () => {},
    })

    return new Promise((resolve) => {
      const router = new Router()
      const options = { ...params, onSuccess: () => resolve(currentPage.get()) }

      if (replace) {
        router.replace(options)
      } else {
        router.push(options)
      }
    })
  }

  it('leaves the stack behind when a client visit installs another page', async () => {
    const page = await clientVisit({ component: 'Reports/Index', url: 'http://localhost/reports' })

    expect(page.component).toBe('Reports/Index')
    expect(page.layers).toBeUndefined()
  })

  it('leaves the stack behind when a client visit pushes another state of the same component', async () => {
    const page = await clientVisit({ url: 'http://localhost/users/2', props: { users: [{ id: 2 }] } })

    expect(page.layers).toBeUndefined()
  })

  it('keeps the stack when a client visit only rewrites the page beneath it', async () => {
    const page = await clientVisit({ url: 'http://localhost/users?page=2' }, { replace: true })

    expect(page.layers!.map((layer) => layer.key)).toEqual(['Users/Edit'])
  })

  it('keeps the stack when a prop helper rewrites the page beneath it', async () => {
    const page = await clientVisit({ props: { users: [{ id: 1 }] } }, { replace: true })

    expect(page.props).toEqual({ users: [{ id: 1 }] })
    expect(page.layers!.map((layer) => layer.key)).toEqual(['Users/Edit'])
  })
})

describe('a client visit aimed at a layer', () => {
  const stacked = (): Page =>
    composeLayer(
      pageWith(),
      pageWith({ component: 'Users/Edit', layer: { key: 'Users/Edit' }, props: { user: { id: 5 }, todos: [1] } }),
      'layer-1',
    )

  const hold = (): Router => {
    currentPage.init({
      initialPage: stacked(),
      resolveComponent: (name) => ({ name }) as never,
      swapComponent: async () => {},
    })

    return new Router()
  }

  const layerVisit = (params: ClientSideVisitOptions, { replace = false } = {}): Promise<Page> => {
    const router = hold()

    return new Promise((resolve) => {
      const options = { ...params, layerId: 'layer-1', onSuccess: () => resolve(currentPage.get()) }

      if (replace) {
        router.replace(options)
      } else {
        router.push(options)
      }
    })
  }

  it("replaceProp changes the layer's own props, not the page's", async () => {
    const router = hold()

    const page = await new Promise<Page>((resolve) => {
      router.replaceProp('todos', [7], { layerId: 'layer-1', onSuccess: () => resolve(currentPage.get()) })
    })

    expect(page.layers![0].props).toEqual({ user: { id: 5 }, todos: [7] })
    expect(page.props).toEqual({ users: [] })
  })

  it('leaves the scroll of the page beneath alone', async () => {
    const reset = vi.spyOn(Scroll, 'reset')

    await layerVisit({ props: { user: { id: 9 } } })

    expect(reset).not.toHaveBeenCalled()
  })

  it('still resets the scroll when it is aimed at the page', async () => {
    const router = hold()
    const reset = vi.spyOn(Scroll, 'reset')

    await new Promise((resolve) => router.push({ props: { users: [] }, onSuccess: resolve }))

    expect(reset).toHaveBeenCalled()
  })

  it('a push keeps the stack and the base generation', async () => {
    const generation = currentPage.generation()
    const page = await layerVisit({
      url: '/users/5/edit?step=2',
      props: { user: { id: 5 }, step: 2 },
    })

    expect(page.layers!.map((layer) => layer.key)).toEqual(['Users/Edit'])
    expect(currentPage.generation()).toBe(generation)
    expect(page.layers![0].url).toBe('/users/5/edit?step=2')
    expect(page.layers![0].props).toEqual(expect.objectContaining({ step: 2 }))
    expect(page.props).toEqual({ users: [] })
  })

  it('a replace keeps the stack and the base generation', async () => {
    const generation = currentPage.generation()
    const page = await layerVisit({ props: { user: { id: 9 } } }, { replace: true })

    expect(page.layers!.map((layer) => layer.key)).toEqual(['Users/Edit'])
    expect(currentPage.generation()).toBe(generation)
    expect(page.layers![0].props).toEqual(expect.objectContaining({ user: { id: 9 } }))
    expect(page.props).toEqual({ users: [] })
  })

  it('does not write a stale layer id onto the page it installs', async () => {
    const router = hold()

    const page = await new Promise<Page>((resolve) => {
      router.push({
        url: '/reports',
        props: { users: [{ id: 9 }] },
        layerId: 'stale',
        onSuccess: () => resolve(currentPage.get()),
      })
    })

    expect(page.component).toBe('Users/Index')
    expect(page).not.toHaveProperty('layerId')
  })

  it('carries the layer errors it brings into onError', async () => {
    const router = hold()
    let announcedErrors: unknown = undefined
    let success = false

    await new Promise<void>((resolve) => {
      router.replace({
        layerId: 'layer-1',
        props: (layerProps) => ({ ...layerProps, errors: { note: 'The note is required.' } }),
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

    expect(success).toBe(false)
    expect(announcedErrors).toEqual({ note: 'The note is required.' })
  })

  it("hands the props function the layer's onceProps", async () => {
    currentPage.init({
      initialPage: composeLayer(
        pageWith(),
        pageWith({
          component: 'Users/Edit',
          layer: { key: 'Users/Edit' },
          props: { user: { id: 5 }, layerProp: 'layer value' },
          onceProps: { layerKey: { prop: 'layerProp' } },
        }),
        'layer-1',
      ),
      resolveComponent: (name) => ({ name }) as never,
      swapComponent: async () => {},
    })

    const router = new Router()
    let receivedOnce: unknown = undefined

    await new Promise<void>((resolve) => {
      router.replace({
        layerId: 'layer-1',
        props: (layerProps, onceProps) => {
          receivedOnce = onceProps
          return layerProps
        },
        onSuccess: () => resolve(),
      })
    })

    expect(receivedOnce).toEqual({ layerProp: 'layer value' })
  })

  it("does not fall back to the page's errors", async () => {
    currentPage.init({
      initialPage: composeLayer(
        pageWith({ props: { users: [], errors: { name: 'The name is required.' } } }),
        pageWith({ component: 'Users/Edit', layer: { key: 'Users/Edit' }, props: { user: { id: 5 }, todos: [1] } }),
        'layer-1',
      ),
      resolveComponent: (name) => ({ name }) as never,
      swapComponent: async () => {},
    })

    const router = new Router()
    let announcedErrors: unknown = undefined
    let success = false

    await new Promise<void>((resolve) => {
      router.replace({
        layerId: 'layer-1',
        props: (layerProps) => ({ ...layerProps, todos: [7] }),
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

    expect(success).toBe(true)
    expect(announcedErrors).toBeUndefined()
  })

  it('applies and announces flash on the layer', async () => {
    const router = hold()
    let announcedFlash: unknown = undefined

    await new Promise<void>((resolve) => {
      router.replace({
        layerId: 'layer-1',
        props: (layerProps) => ({ ...layerProps, todos: [7] }),
        flash: { message: 'Saved.' },
        onFlash: (flash) => {
          announcedFlash = flash
          resolve()
        },
        onSuccess: () => resolve(),
      })
    })

    expect(announcedFlash).toEqual({ message: 'Saved.' })
    expect(currentPage.get().layers![0].flash).toEqual({ message: 'Saved.' })
    expect(currentPage.get().flash).toEqual({})
  })

  it('clears the flash a layer was already showing, rather than announcing it a second time', async () => {
    const router = hold()

    await new Promise<void>((resolve) => {
      router.replace({ layerId: 'layer-1', flash: { message: 'Saved.' }, onSuccess: () => resolve() })
    })

    const announced: unknown[] = []

    await new Promise<void>((resolve) => {
      router.replace({
        layerId: 'layer-1',
        props: (layerProps) => ({ ...layerProps, todos: [7] }),
        onFlash: (flash) => announced.push(flash),
        onSuccess: () => resolve(),
      })
    })

    expect(announced).toEqual([])
    expect(currentPage.get().layers![0].flash).toEqual({})
  })
})

describe('a response that refreshes the base', () => {
  class ExposedResponse extends Response {
    public refreshes(pageResponse: Page): boolean {
      return this.refreshesBase(pageResponse)
    }

    public merge(pageResponse: Page): void {
      this.mergeProps(pageResponse)
    }
  }

  const responseFor = (visit: Partial<ActiveVisit>) => {
    currentPage.init({
      initialPage: pageWith(),
      resolveComponent: (name) => ({ name }) as never,
      swapComponent: async () => {},
    })

    const params = { only: [], except: [], reset: [], ...visit } as unknown as ActiveVisit

    return new ExposedResponse(RequestParams.create(params), {} as HttpResponse, pageWith(), {
      page: pageWith(),
      generation: currentPage.generation(),
    })
  }

  it('a reload of the same component refreshes it', () => {
    expect(responseFor({ reload: true } as Partial<ActiveVisit>).refreshes(pageWith())).toBe(true)
  })

  it('a reload redirected to another component does not', () => {
    const redirected = pageWith({ component: 'Auth/Login', url: '/login' })

    expect(responseFor({ reload: true } as Partial<ActiveVisit>).refreshes(redirected)).toBe(false)
  })

  it('a visit to another url of the same component does not', () => {
    const elsewhere = pageWith({ url: '/users?page=2' })

    expect(responseFor({}).refreshes(elsewhere)).toBe(false)
  })

  it('a partial reload of the same component still refreshes it', () => {
    expect(responseFor({ only: ['users'] }).refreshes(pageWith())).toBe(true)
  })

  it('a partial reload of another url of the same component does not', () => {
    expect(responseFor({ only: ['users'] }).refreshes(pageWith({ url: '/users?search=x' }))).toBe(false)
  })

  it('does not merge a plain reload into the props already held', () => {
    const response = responseFor({ reload: true } as Partial<ActiveVisit>)
    const pageResponse = pageWith({ props: { users: [{ id: 1 }] } })

    currentPage.merge({ props: { users: [], stale: true } as Page['props'] })
    response.merge(pageResponse)

    expect(pageResponse.props).toEqual({ users: [{ id: 1 }] })
  })
})

describe('the base a layer response composes onto', () => {
  const visit = (url: string, options: VisitOptions = {}, router = new Router()): Promise<Page> =>
    new Promise((resolve) => {
      const settle = () => resolve(currentPage.get())

      router.visit(url, { ...options, onSuccess: settle, onError: settle })
    })

  const cached = () => (prefetchedRequests as unknown as { cached: unknown[] }).cached

  beforeEach(() => {
    prefetchedRequests.removeAll()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('composes onto the page a visit aimed at the layer was made from', async () => {
    await hold(pageWith())
    const generation = currentPage.generation()
    respondWith(editLayer())

    const page = await visit('http://localhost/users/5/edit')

    expect(page.component).toBe('Users/Index')
    expect(page.url).toBe('/users')
    expect(page.layers).toEqual([expect.objectContaining({ key: 'Users/Edit', url: '/users/5/edit' })])
    expect(currentPage.generation()).toBe(generation)
  })

  it('composes onto the page it names as its base, when a create redirects to the record', async () => {
    await hold(pageWith())
    const generation = currentPage.generation()
    respondWith(editLayer({ layer: { key: 'Users/Edit', base: '/users' } }))

    const page = await visit('http://localhost/users', { method: 'post' })

    expect(page.component).toBe('Users/Index')
    expect(page.url).toBe('/users')
    expect(page.layers).toEqual([expect.objectContaining({ key: 'Users/Edit', url: '/users/5/edit' })])
    expect(currentPage.generation()).toBe(generation)
  })

  it('walks a base back for a layer whose base is not the page on screen', async () => {
    await hold(pageWith({ component: 'Auth/Login', url: '/login' }))
    respondWith(editLayer({ layer: { key: 'Users/Edit', base: '/users' } }))

    const page = await visit('http://localhost/login', { method: 'post' })

    expect(page.component).toBe('')
    expect(page.layers).toEqual([expect.objectContaining({ key: 'Users/Edit', standalone: true })])
  })

  it('takes the asset version the layer arrived on', async () => {
    await hold(pageWith({ version: 'old' }))
    respondWith(editLayer({ version: 'new' }))

    const page = await visit('http://localhost/users/5/edit', { method: 'post' })

    expect(page.version).toBe('new')
  })

  it('composes onto the page beneath a layer that is already open', async () => {
    await hold(composeLayer(pageWith(), editLayer(), 'layer-1'))
    const generation = currentPage.generation()
    respondWith(editLayer({ props: { user: { id: 5 }, errors: { name: 'The name field is required.' } } }))

    const page = await visit('http://localhost/users/5', { method: 'post' })

    expect(page.component).toBe('Users/Index')
    expect(page.url).toBe('/users')
    expect(page.layers).toEqual([
      expect.objectContaining({
        id: 'layer-1',
        props: { user: { id: 5 }, errors: { name: 'The name field is required.' } },
      }),
    ])
    expect(currentPage.generation()).toBe(generation)
  })

  it('composes onto a layer that opened while the visit was in flight', async () => {
    await hold(pageWith())
    let answer: ((response: unknown) => void) | null = null
    http.setClient({ request: () => new Promise((resolve) => (answer = resolve)) })

    const settled = visit('http://localhost/users/5', { method: 'post' })
    await vi.waitFor(() => expect(answer).not.toBeNull())

    await currentPage.set(composeLayer(currentPage.get(), editLayer(), 'layer-1'), { preservesBase: true })
    const generation = currentPage.generation()

    answer!({ status: 200, data: editLayer(), headers: { 'x-inertia': 'true' } })

    const page = await settled

    expect(page.component).toBe('Users/Index')
    expect(page.layers).toEqual([expect.objectContaining({ id: 'layer-1', key: 'Users/Edit' })])
    expect(currentPage.generation()).toBe(generation)
  })

  it('composes onto the stack when a visit from inside it comes back as a different layer', async () => {
    await hold(composeLayer(pageWith(), editLayer(), 'layer-1'))
    respondWith(
      pageWith({ component: 'Teams/Show', url: '/teams/9', layer: { key: 'Teams/Show' }, props: { team: { id: 9 } } }),
    )

    const page = await visit('http://localhost/users/5/promote', { method: 'post' })

    expect(page.component).toBe('Users/Index')
    expect(page.layers!.map((layer) => layer.key)).toEqual(['Users/Edit', 'Teams/Show'])
  })

  it('composes onto the stack when the layer the visit was sent from is still open', async () => {
    const notes = pageWith({ component: 'Users/Notes', url: '/users/5/notes', layer: { key: 'Users/Notes' } })

    await hold(composeLayer(composeLayer(pageWith(), editLayer(), 'layer-edit'), notes, 'layer-notes'))

    let answer: ((response: unknown) => void) | null = null
    http.setClient({ request: () => new Promise((resolve) => (answer = resolve)) })

    const settled = visit('http://localhost/users/5/promote', { method: 'post' }, new Router('layer-edit'))
    await vi.waitFor(() => expect(answer).not.toBeNull())

    await currentPage.set(closeLayer(currentPage.get(), 'layer-notes'), { preservesBase: true })

    answer!({
      status: 200,
      data: pageWith({ component: 'Teams/Show', url: '/teams/9', layer: { key: 'Teams/Show' } }),
      headers: { 'x-inertia': 'true' },
    })

    const page = await settled

    expect(page.component).toBe('Users/Index')
    expect(page.layers!.map((layer) => layer.key)).toEqual(['Users/Edit', 'Teams/Show'])
  })

  it('promotes a layer when the page moved to another url of the same component while it was in flight', async () => {
    await hold(pageWith())
    let answer: ((response: unknown) => void) | null = null
    http.setClient({ request: () => new Promise((resolve) => (answer = resolve)) })

    const settled = visit('http://localhost/users/5/edit')
    await vi.waitFor(() => expect(answer).not.toBeNull())

    respondWith(pageWith({ url: '/users?search=x', props: { users: [{ id: 9 }] } }))
    await visit('http://localhost/users?search=x', { only: ['users'], async: true })

    answer!({ status: 200, data: editLayer(), headers: { 'x-inertia': 'true' } })
    const page = await settled

    expect(page.component).toBe('Users/Edit')
    expect(page.layers).toBeUndefined()
  })

  it('composes a layer across a background reload that refreshes the base in place', async () => {
    await hold(pageWith())
    const generation = currentPage.generation()
    let answer: ((response: unknown) => void) | null = null
    http.setClient({ request: () => new Promise((resolve) => (answer = resolve)) })

    const settled = visit('http://localhost/users/5/edit')
    await vi.waitFor(() => expect(answer).not.toBeNull())

    respondWith(pageWith({ url: '/users?page=2', props: { users: [{ id: 9 }] } }))
    await new Promise<void>((resolve) => {
      new Router().reload({ only: ['users'], data: { page: 2 }, preserveUrl: true, onSuccess: () => resolve() })
    })
    expect(currentPage.generation()).toBe(generation)

    answer!({ status: 200, data: editLayer(), headers: { 'x-inertia': 'true' } })
    const page = await settled

    expect(page.component).toBe('Users/Index')
    expect(page.props).toEqual({ users: [{ id: 9 }] })
    expect(page.layers).toEqual([expect.objectContaining({ key: 'Users/Edit' })])
  })

  it('composes a layer opened by a visit that preserves the url', async () => {
    await hold(pageWith())
    respondWith(editLayer())

    const page = await visit('http://localhost/users/5/edit', { preserveUrl: true })

    expect(page.component).toBe('Users/Index')
    expect(page.layers).toEqual([expect.objectContaining({ key: 'Users/Edit' })])
  })

  it('gives a layer opened by a visit that preserves the url its own url, but not the address', async () => {
    await hold(pageWith())
    respondWith(editLayer())

    const page = await visit('http://localhost/users/5/edit', { preserveUrl: true })

    expect(page.layers).toEqual([
      expect.objectContaining({ key: 'Users/Edit', url: '/users/5/edit', preservesUrl: true }),
    ])
    expect(addressOf(page)).toBe('/users')
  })

  it('leaves an open layer the url it already had when a preserving reload rewrites it', async () => {
    await hold(pageWith())
    respondWith(editLayer())
    await visit('http://localhost/users/5/edit')

    const [layer] = currentPage.get().layers!
    respondWith(editLayer({ url: '/users/5/edit?page=2', props: { user: { id: 5 }, notes: [1] } }))

    await visit('http://localhost/users/5/edit?page=2', {
      layerId: layer.id,
      only: ['notes'],
      preserveUrl: true,
    })

    expect(currentPage.get().layers).toEqual([expect.objectContaining({ id: layer.id, url: '/users/5/edit' })])
    expect(addressOf(currentPage.get())).toBe('/users/5/edit')
  })

  it('leaves the address on the layer beneath when a layer opens without moving the url', async () => {
    await hold(pageWith())
    respondWith(editLayer())
    await visit('http://localhost/users/5/edit')

    await new Promise((resolve) => setTimeout(resolve))

    respondWith(pageWith({ component: 'Users/Notes', url: '/users/5/notes', layer: { key: 'Users/Notes' } }))
    await visit('http://localhost/users/5/notes', { preserveUrl: true })

    await vi.waitFor(() => expect(history.preserveUrl).toBe(false))
    const replaceState = vi.spyOn(window.history, 'replaceState')

    await new Promise<void>((resolve) => {
      new Router().replace({ props: { users: [{ id: 1 }] }, onSuccess: () => resolve() })
    })

    expect(replaceState).toHaveBeenCalledWith(expect.anything(), '', '/users/5/edit')
    expect(currentPage.get().layers!.map((layer) => [layer.url, !!layer.preservesUrl])).toEqual([
      ['/users/5/edit', false],
      ['/users/5/notes', true],
    ])
    expect(addressOf(currentPage.get())).toBe('/users/5/edit')
  })

  it('promotes a layer dispatched from a layer the user dismissed while it was in flight', async () => {
    await hold(composeLayer(pageWith(), editLayer(), 'layer-1'))
    const generation = currentPage.generation()
    let answer: ((response: unknown) => void) | null = null
    http.setClient({ request: () => new Promise((resolve) => (answer = resolve)) })

    const settled = visit('http://localhost/users/5/promote', { method: 'post' })
    await vi.waitFor(() => expect(answer).not.toBeNull())

    await currentPage.set(closeLayer(currentPage.get(), 'layer-1'), { preservesBase: true })

    answer!({
      status: 200,
      data: pageWith({ component: 'Teams/Show', url: '/teams/9', layer: { key: 'Teams/Show' } }),
      headers: { 'x-inertia': 'true' },
    })
    const page = await settled

    expect(page.component).toBe('Teams/Show')
    expect(page.layers).toBeUndefined()
    expect(currentPage.generation()).not.toBe(generation)
  })

  it('does not reopen a layer the user dismissed while a submit inside it was in flight', async () => {
    await hold(composeLayer(pageWith(), editLayer(), 'layer-1'))
    let answer: ((response: unknown) => void) | null = null
    http.setClient({ request: () => new Promise((resolve) => (answer = resolve)) })

    const settled = visit('http://localhost/users/5', { method: 'post' })
    await vi.waitFor(() => expect(answer).not.toBeNull())

    await currentPage.set(closeLayer(currentPage.get(), 'layer-1'), { preservesBase: true })

    answer!({
      status: 200,
      data: editLayer({ props: { user: { id: 5 }, errors: { name: 'The name field is required.' } } }),
      headers: { 'x-inertia': 'true' },
    })
    const page = await settled

    expect(page.component).toBe('Users/Edit')
    expect(page.layers).toBeUndefined()
  })

  it('promotes a layer to a page when it comes back through a login page', async () => {
    await hold(pageWith({ component: 'Auth/Login', url: '/login' }))
    const generation = currentPage.generation()
    respondWith(editLayer())

    const page = await visit('http://localhost/login', { method: 'post' })

    expect(page.component).toBe('Users/Edit')
    expect(page.url).toBe('/users/5/edit')
    expect(page.layers).toBeUndefined()
    expect(page).not.toHaveProperty('layer')
    expect(currentPage.generation()).not.toBe(generation)
  })

  it('composes a layer router.layer() asked for, whatever url the server answered from', async () => {
    await hold(pageWith())
    const generation = currentPage.generation()
    respondWith(editLayer())

    const handle = new Router().layer('http://localhost/users/5/edit-start', { method: 'post' })
    await vi.waitFor(() => expect(currentPage.get().layers).toHaveLength(1))

    expect(currentPage.get().component).toBe('Users/Index')
    expect(currentPage.get().layers).toEqual([
      expect.objectContaining({ id: handle.id, key: 'Users/Edit', url: '/users/5/edit' }),
    ])
    expect(currentPage.generation()).toBe(generation)
  })

  it('promotes a layer router.layer() asked for when the page beneath it was replaced in flight', async () => {
    await hold(pageWith())
    let answer: ((response: unknown) => void) | null = null
    http.setClient({ request: () => new Promise((resolve) => (answer = resolve)) })

    new Router().layer('http://localhost/users/5/edit-start', { method: 'post' })
    await vi.waitFor(() => expect(answer).not.toBeNull())

    await currentPage.setQuietly(pageWith({ component: 'Users/Archive', url: '/users/archive' }))

    answer!({ status: 200, data: editLayer(), headers: { 'x-inertia': 'true' } })

    await vi.waitFor(() => expect(currentPage.get().component).toBe('Users/Edit'))
    expect(currentPage.get().layers).toBeUndefined()
  })

  it('promotes a prefetched layer replayed onto a base an instant swap has since replaced', async () => {
    await hold(pageWith())
    respondWith(editLayer())
    const router = new Router()

    router.prefetch('http://localhost/users/5/edit', {}, { cacheFor: '30s' })
    await vi.waitFor(() => expect(cached()).toHaveLength(1))

    await currentPage.setQuietly(pageWith({ component: 'Users/Archive', url: '/users/archive' }))
    await currentPage.setQuietly(pageWith({ component: 'Users/Trash', url: '/users/trash' }))

    const page = await visit('http://localhost/users/5/edit', { component: 'Users/Edit' }, router)

    expect(page.props).toEqual({ user: { id: 5 } })
    expect(page.layers).toBeUndefined()
  })
})

describe('the prefetch cache shared between the page and its layers', () => {
  const cached = () => (prefetchedRequests as unknown as { cached: unknown[] }).cached

  beforeEach(() => {
    prefetchedRequests.removeAll()
  })

  afterEach(() => {
    prefetchedRequests.removeAll()
    vi.restoreAllMocks()
  })

  it('answers a lookup from the page or another layer with what a layer prefetched', async () => {
    await hold(pageWith())
    respondWith(editLayer())

    new Router().prefetch('http://localhost/users/5/edit', { layerId: 'layer-1' }, { cacheFor: '30s' })
    await vi.waitFor(() => expect(cached()).toHaveLength(1))

    expect(new Router().getCached('http://localhost/users/5/edit', {})).not.toBeNull()
    expect(new Router().getCached('http://localhost/users/5/edit', { layerId: 'layer-2' })).not.toBeNull()
  })

  it('does not answer a lookup that asks for other props', async () => {
    await hold(pageWith())
    respondWith(editLayer())

    new Router().prefetch('http://localhost/users/5/edit', { layerId: 'layer-1' }, { cacheFor: '30s' })
    await vi.waitFor(() => expect(cached()).toHaveLength(1))

    expect(new Router().getCached('http://localhost/users/5/edit', { only: ['user'] })).toBeNull()
  })
})

describe("a layer's own component across a rewrite", () => {
  const rendered: ResolvedLayer[][] = []

  const openEdit = async (): Promise<number> => {
    rendered.length = 0

    currentPage.init({
      initialPage: pageWith(),
      resolveComponent: (name) => ({ name }) as never,
      swapComponent: async ({ layers }) => {
        rendered.push(layers ?? [])
      },
    })

    await currentPage.setQuietly(pageWith())
    respondWith(editLayer())

    await new Promise<void>((resolve) => {
      new Router().visit('http://localhost/users/5/edit', { onSuccess: () => resolve(), onError: () => resolve() })
    })

    return rendered.at(-1)![0].renderKey
  }

  const rewrite = async (options: VisitOptions): Promise<number> => {
    respondWith(editLayer({ props: { user: { id: 6 } } }))

    await new Promise<void>((resolve) => {
      new Router().visit('http://localhost/users/6/edit', {
        ...options,
        onSuccess: () => resolve(),
        onError: () => resolve(),
      })
    })

    return rendered.at(-1)![0].renderKey
  }

  it('remakes the component when the visit did not preserve state', async () => {
    const opened = await openEdit()

    expect(await rewrite({})).not.toBe(opened)
  })

  it('keeps the component when the visit preserved state', async () => {
    const opened = await openEdit()

    expect(await rewrite({ preserveState: true })).toBe(opened)
  })
})

describe('a layer response that names an earlier level', () => {
  const visit = (url: string, options: VisitOptions = {}, router = new Router()): Promise<Page> =>
    new Promise((resolve) => {
      const settle = () => resolve(currentPage.get())

      router.visit(url, { ...options, onSuccess: settle, onError: settle })
    })

  const notesLayer = (overrides: Partial<Page> = {}): Page =>
    pageWith({ component: 'Users/Notes', url: '/users/5/edit/notes', layer: { key: 'Users/Notes' }, ...overrides })

  const stack = async (): Promise<[LayerState, LayerState]> => {
    await hold(pageWith())

    respondWith(editLayer())
    await visit('http://localhost/users/5/edit')

    respondWith(notesLayer())
    await visit('http://localhost/users/5/edit/notes')

    const [edit, notes] = currentPage.get().layers!

    expect([edit.entries, notes.entries]).toEqual([1, 1])

    return [edit, notes]
  }

  afterEach(() => {
    layerClosing.settleUnwind()
  })

  it('closes the layers above the one it lands on, rewriting that layer where it stands', async () => {
    const [edit, notes] = await stack()
    const closed: string[] = []
    router.layerHandle(notes.id).onClose(() => closed.push(notes.id))

    respondWith(editLayer({ url: '/users/6/edit', props: { user: { id: 6 } } }))

    const page = await visit('http://localhost/users/6/edit')

    expect(page.layers!.map((layer) => layer.id)).toEqual([edit.id])
    expect(page.layers![0].props).toEqual({ user: { id: 6 } })
    expect(addressOf(page)).toBe('/users/6/edit')
    expect(closed).toEqual([notes.id])
  })

  it('gives the layer it lands on the entries the closed layers owned', async () => {
    const [edit] = await stack()
    respondWith(editLayer({ url: '/users/6/edit' }))

    const page = await visit('http://localhost/users/6/edit')

    expect(page.layers![0].entries).toBe(3)
    expect(entriesToUnwind(page, edit.id)).toBe(3)
  })

  it('does not cancel a reload of the page when the close refreshes the layer beneath', async () => {
    const edit = composeLayer(pageWith(), editLayer(), 'edit', { url: '/users/5/edit' })

    await hold(composeLayer(edit, notesLayer(), 'notes', { url: '/users/5/edit/notes' }))

    let cancelled = false
    http.setClient({ request: () => new Promise(() => {}) })
    new Router().reload({ only: ['users'], onCancel: () => (cancelled = true) } as VisitOptions)
    await new Promise((resolve) => setTimeout(resolve))

    const requested: string[] = []
    http.setClient({
      request: ({ url }) => {
        requested.push(new URL(url).pathname)

        return new Promise(() => {})
      },
    })

    await router.close('notes')

    await vi.waitFor(() => expect(requested).toEqual(['/users/5/edit']))
    expect(cancelled).toBe(false)
  })

  it('leaves the layers above alone when a poll refreshes the layer beneath them', async () => {
    const [edit, notes] = await stack()
    respondWith(editLayer({ props: { user: { id: 5, seen: 1 } } }))

    await new Promise<void>((resolve) => {
      router.reload({ layerId: edit.id, onSuccess: () => resolve(), onError: () => resolve() } as VisitOptions)
    })

    const page = currentPage.get()

    expect(page.layers!.map((layer) => layer.id)).toEqual([edit.id, notes.id])
    expect(page.layers![0].props).toEqual({ user: { id: 5, seen: 1 } })
    expect(addressOf(page)).toBe('/users/5/edit/notes')
  })

  it('leaves the layers above alone when a deferred group fills in the layer beneath them', async () => {
    const [edit, notes] = await stack()
    respondWith(editLayer({ props: { user: { id: 5 }, history: [1] } }))

    await new Promise<void>((resolve) => {
      router.reload({
        layerId: edit.id,
        only: ['history'],
        onSuccess: () => resolve(),
        onError: () => resolve(),
      } as VisitOptions)
    })

    const page = currentPage.get()

    expect(page.layers!.map((layer) => layer.id)).toEqual([edit.id, notes.id])
    expect(page.layers![0].props).toEqual({ user: { id: 5 }, history: [1] })
  })

  it('leaves a response that lands on the top layer stacked exactly as it was', async () => {
    const [edit, notes] = await stack()
    respondWith(notesLayer({ url: '/users/5/edit/other-notes' }))

    const page = await visit('http://localhost/users/5/edit/other-notes')

    expect(page.layers!.map((layer) => layer.id)).toEqual([edit.id, notes.id])
    expect(addressOf(page)).toBe('/users/5/edit/other-notes')
  })
})

describe('an open layer across a partial or reload', () => {
  const visit = (url: string, options: VisitOptions = {}, router = new Router()): Promise<Page> =>
    new Promise((resolve) => {
      const settle = () => resolve(currentPage.get())

      router.visit(url, { ...options, onSuccess: settle, onError: settle })
    })

  const queueSettled = () => new Promise((resolve) => setTimeout(resolve))

  const openWarm = async (layerProps: Page['props'] = { user: { id: 5 } }): Promise<void> => {
    await hold(pageWith())
    respondWith(editLayer({ props: layerProps }))
    await visit('http://localhost/users/5/edit')
    await queueSettled()
  }

  const openCold = async (layerProps: Page['props'] = { user: { id: 5 } }): Promise<void> => {
    await hold(pageWith())
    await currentPage.set(
      composeColdLayer(editLayer({ layer: { base: '/users' }, props: layerProps }), nextLayerId(pageWith())),
      {
        preservesBase: true,
      },
    )
  }

  beforeEach(() => {
    prefetchedRequests.removeAll()
  })

  afterEach(async () => {
    await queueSettled()
    vi.restoreAllMocks()
  })

  it('keeps a warm layer when a partial refreshes the base beneath it', async () => {
    await openWarm({ user: { id: 5 }, stats: [1] })
    const generation = currentPage.generation()
    const [layer] = currentPage.get().layers!
    respondWith(pageWith({ props: { stats: [1, 2, 3] } }))

    await visit('http://localhost/users', { only: ['stats'] })

    expect(currentPage.get().layers).toEqual([expect.objectContaining({ id: layer.id })])
    expect(currentPage.get().layers!.map((open) => open.id)).toEqual([layer.id])
    expect(currentPage.get().layers![0].props).toEqual({ user: { id: 5 }, stats: [1] })
    expect(currentPage.get().props).toEqual({ users: [], stats: [1, 2, 3] })
    expect(currentPage.generation()).toBe(generation)
  })

  it('keeps a warm layer when a plain reload refreshes the base beneath it', async () => {
    await openWarm({ user: { id: 5 }, stats: [1] })
    const generation = currentPage.generation()
    const [layer] = currentPage.get().layers!
    respondWith(pageWith({ props: { users: [{ id: 9 }] } }))
    await queueSettled()

    await new Promise<void>((resolve) => {
      new Router().reload({ onSuccess: () => resolve(), onError: () => resolve() })
    })

    expect(currentPage.get().layers).toEqual([expect.objectContaining({ id: layer.id })])
    expect(currentPage.get().layers![0].props).toEqual({ user: { id: 5 }, stats: [1] })
    expect(currentPage.get().props).toEqual({ users: [{ id: 9 }] })
    expect(currentPage.generation()).toBe(generation)
  })

  it('keeps a warm layer when a partial moves the base to another url of the same component', async () => {
    await openWarm({ user: { id: 5 } })
    const generation = currentPage.generation()
    const [layer] = currentPage.get().layers!
    respondWith(pageWith({ url: '/users?search=x', props: { users: [{ id: 9 }] } }))

    await visit('http://localhost/users?search=x', { only: ['users'] })

    expect(currentPage.get().layers).toEqual([expect.objectContaining({ id: layer.id })])
    expect(currentPage.generation()).not.toBe(generation)
    expect(currentPage.get().props).toEqual(expect.objectContaining({ users: [{ id: 9 }] }))
  })

  it("drops the stack when a layer's own reload is answered by another page", async () => {
    await openWarm({ user: { id: 5 } })
    const [layer] = currentPage.get().layers!
    respondWith(pageWith({ component: 'Auth/Login', url: '/login', props: {} }))
    await queueSettled()

    await new Promise<void>((resolve) => {
      new Router(layer.id).reload({ onSuccess: () => resolve(), onError: () => resolve() })
    })

    expect(currentPage.get().component).toBe('Auth/Login')
    expect(currentPage.get().layers).toBeUndefined()
  })

  it('drops the stack when a reload of the base is answered by another page', async () => {
    await openWarm({ user: { id: 5 } })
    respondWith(pageWith({ component: 'Auth/Login', url: '/login', props: {} }))
    await queueSettled()

    await new Promise<void>((resolve) => {
      new Router().reload({ onSuccess: () => resolve(), onError: () => resolve() })
    })

    expect(currentPage.get().component).toBe('Auth/Login')
    expect(currentPage.get().layers).toBeUndefined()
  })

  it("merges a warm layer's props when a partial is answered by the layer, keeping its siblings", async () => {
    await openWarm({ user: { id: 5 }, stats: [1] })
    const [layer] = currentPage.get().layers!
    respondWith(editLayer({ props: { stats: [1, 2, 3] } }))

    await visit('http://localhost/users/5/edit', { only: ['stats'] })

    expect(currentPage.get().layers).toEqual([expect.objectContaining({ id: layer.id })])
    expect(currentPage.get().layers![0].props).toEqual({ user: { id: 5 }, stats: [1, 2, 3] })
  })

  it('starts a layer clean when a partial is answered under its key by another component', async () => {
    await openWarm({ user: { id: 5 }, stats: [1] })
    const [layer] = currentPage.get().layers!
    respondWith(editLayer({ component: 'Users/Show', props: { stats: [1, 2, 3] } }))

    await visit('http://localhost/users/5/edit', { only: ['stats'] })

    expect(currentPage.get().layers).toEqual([expect.objectContaining({ id: layer.id, component: 'Users/Show' })])
    expect(currentPage.get().layers![0].props).toEqual({ stats: [1, 2, 3] })
  })

  it("keeps a layer's scroll and once props across a partial that carried neither", async () => {
    const scrollProps = {
      stats: { pageName: 'page', previousPage: null, nextPage: 2, currentPage: 1, reset: false },
    }
    const onceProps = { welcome: { prop: 'user', expiresAt: 123 } }

    await hold(pageWith())
    respondWith(editLayer({ props: { user: { id: 5 }, stats: [1] }, scrollProps, onceProps }))
    await visit('http://localhost/users/5/edit')
    await queueSettled()

    respondWith(editLayer({ props: { stats: [1, 2, 3] } }))
    await visit('http://localhost/users/5/edit', { only: ['stats'] })

    expect(currentPage.get().layers![0].scrollProps).toEqual(scrollProps)
    expect(currentPage.get().layers![0].onceProps).toEqual(onceProps)
  })

  it("preserves a layer's own errors across a partial that carried none", async () => {
    await hold(pageWith())
    respondWith(editLayer({ props: { user: { id: 5 }, errors: { name: 'Required' } } }))
    await visit('http://localhost/users/5/edit')
    await queueSettled()

    respondWith(editLayer({ props: { stats: [1], errors: {} } }))
    await visit('http://localhost/users/5/edit', { only: ['stats'], preserveErrors: true })

    expect(currentPage.get().layers![0].props.errors).toEqual({ name: 'Required' })
  })

  it("merges a cold layer's props when a partial is answered by the layer, keeping its siblings", async () => {
    await openCold({ user: { id: 5 } })
    const [layer] = currentPage.get().layers!
    respondWith(editLayer({ layer: { base: '/users' }, props: { stats: [1, 2, 3] } }))

    await visit('http://localhost/users/5/edit', { only: ['stats'] })

    expect(currentPage.get().layers).toEqual([expect.objectContaining({ id: layer.id })])
    expect(currentPage.get().layers![0].props).toEqual({ user: { id: 5 }, stats: [1, 2, 3] })
  })

  it('replaces the blank with the real base when a partial is answered by the base, keeping the layer', async () => {
    await openCold({ user: { id: 5 } })
    const [layer] = currentPage.get().layers!
    respondWith(pageWith({ props: { users: [{ id: 9 }], stats: [1, 2, 3] } }))

    await visit('http://localhost/users', { only: ['stats'] })

    expect(currentPage.get().component).toBe('Users/Index')
    expect(currentPage.get().layers).toEqual([expect.objectContaining({ id: layer.id })])
    expect(currentPage.get().props).toEqual(expect.objectContaining({ stats: [1, 2, 3] }))
  })

  it('keeps a prop the response to a partial left out, since a partial merges into the layer', async () => {
    await openWarm({ user: { id: 5 }, stats: [1] })
    const [layer] = currentPage.get().layers!
    respondWith(editLayer({ props: { stats: [1, 2, 3], notes: ['x'] } }))

    await visit('http://localhost/users/5/edit', { only: ['stats'] })

    expect(currentPage.get().layers).toEqual([expect.objectContaining({ id: layer.id })])
    expect(currentPage.get().layers![0].props).toEqual(
      expect.objectContaining({ user: { id: 5 }, stats: [1, 2, 3], notes: ['x'] }),
    )
  })

  it('replaces a layer wholesale when a plain visit is answered by the layer dropping a prop', async () => {
    await openWarm({ user: { id: 5 }, stats: [1] })
    const [layer] = currentPage.get().layers!
    respondWith(editLayer({ props: { stats: [1, 2, 3] } }))

    await visit('http://localhost/users/5/edit')

    expect(currentPage.get().layers).toEqual([expect.objectContaining({ id: layer.id })])
    expect(currentPage.get().layers![0].props).toEqual({ stats: [1, 2, 3] })
  })

  it('keeps a sibling inside a nested layer prop when a partial asks for a dotted path', async () => {
    await openWarm({ user: { id: 5, name: 'Claud' } })
    const [layer] = currentPage.get().layers!
    respondWith(editLayer({ props: { user: { id: 9 } } }))

    await visit('http://localhost/users/5/edit', { only: ['user.id'] })

    expect(currentPage.get().layers).toEqual([expect.objectContaining({ id: layer.id })])
    expect(currentPage.get().layers![0].props).toEqual({ user: { id: 9, name: 'Claud' } })
  })

  it('keeps a layer prop the server left out of an except-only partial, matching the base', async () => {
    await openWarm({ user: { id: 5, name: 'Claud' } })
    const [layer] = currentPage.get().layers!
    respondWith(editLayer({ props: { user: { id: 5 } } }))

    await visit('http://localhost/users/5/edit', { except: ['user.name'] })

    expect(currentPage.get().layers).toEqual([expect.objectContaining({ id: layer.id })])
    expect(currentPage.get().layers![0].props).toEqual({ user: { id: 5, name: 'Claud' } })
  })

  it('keeps a warm layer when a reset-only request refreshes the base beneath it', async () => {
    await openWarm({ user: { id: 5 }, stats: [1] })
    const generation = currentPage.generation()
    const [layer] = currentPage.get().layers!
    respondWith(pageWith({ props: { stats: [1, 2, 3] } }))

    await visit('http://localhost/users', { reset: ['stats'] })

    expect(currentPage.get().layers).toEqual([expect.objectContaining({ id: layer.id })])
    expect(currentPage.get().props).toEqual(expect.objectContaining({ stats: [1, 2, 3] }))
    expect(currentPage.generation()).toBe(generation)
  })

  it('keeps a nested sibling on the base itself across a dotted partial path', async () => {
    await hold(pageWith({ props: { user: { id: 5, name: 'Claud' } } }))
    respondWith(pageWith({ props: { user: { id: 9 } } }))

    await visit('http://localhost/users', { only: ['user.id'] })

    expect(currentPage.get().props).toEqual({ user: { id: 9, name: 'Claud' } })
  })

  it('emits no layers key when a layerless partial reload refreshes the base', async () => {
    await hold(pageWith({ props: { stats: [1] } }))
    respondWith(pageWith({ props: { stats: [1, 2, 3] } }))
    await queueSettled()

    await new Promise<void>((resolve) => {
      new Router().reload({ only: ['stats'], onSuccess: () => resolve(), onError: () => resolve() })
    })

    expect(currentPage.get()).not.toHaveProperty('layers')
    expect(currentPage.get().props).toEqual({ stats: [1, 2, 3] })
  })

  it('appends a layer partial mergeProps to the open layer items', async () => {
    await openWarm({ user: { id: 5 }, items: [1] })
    respondWith(editLayer({ props: { items: [2, 3] }, mergeProps: ['items'] }))

    await visit('http://localhost/users/5/edit', { only: ['items'] })

    expect(currentPage.get().layers).toEqual([expect.objectContaining({ id: expect.any(String) })])
    expect(currentPage.get().layers![0].props).toEqual({ user: { id: 5 }, items: [1, 2, 3] })
  })

  it('prepends a layer partial prependProps before the open layer items', async () => {
    await openWarm({ user: { id: 5 }, items: [3] })
    respondWith(editLayer({ props: { items: [1, 2] }, prependProps: ['items'] }))

    await visit('http://localhost/users/5/edit', { only: ['items'] })

    expect(currentPage.get().layers![0].props).toEqual({ user: { id: 5 }, items: [1, 2, 3] })
  })

  it('deep merges a layer partial deepMergeProps into the open layer', async () => {
    await openWarm({ user: { id: 5 }, filters: { status: 'open', sort: 'asc' } })
    respondWith(editLayer({ props: { filters: { status: 'closed' } }, deepMergeProps: ['filters'] }))

    await visit('http://localhost/users/5/edit', { only: ['filters'] })

    expect(currentPage.get().layers![0].props).toEqual({ user: { id: 5 }, filters: { status: 'closed', sort: 'asc' } })
  })

  it('matches layer partial items by matchPropsOn and updates them in place', async () => {
    await openWarm({
      user: { id: 5 },
      items: [
        { id: 1, name: 'old' },
        { id: 2, name: 'keep' },
      ],
    })
    respondWith(
      editLayer({
        props: { items: [{ id: 1, name: 'new' }] },
        mergeProps: ['items'],
        matchPropsOn: ['items.id'],
      }),
    )

    await visit('http://localhost/users/5/edit', { only: ['items'] })

    expect(currentPage.get().layers![0].props).toEqual({
      user: { id: 5 },
      items: [
        { id: 1, name: 'new' },
        { id: 2, name: 'keep' },
      ],
    })
  })

  it('merges a same-component layer partial against the layer, never the base', async () => {
    await hold(pageWith({ props: { users: [], items: [10] } }))
    respondWith(
      pageWith({
        component: 'Users/Index',
        url: '/users/filtered',
        layer: { key: 'Users/Index' },
        props: { items: [1], filter: 'open' },
      }),
    )
    await visit('http://localhost/users/filtered')
    await queueSettled()

    respondWith(
      pageWith({
        component: 'Users/Index',
        url: '/users/filtered',
        layer: { key: 'Users/Index' },
        props: { items: [2, 3] },
        mergeProps: ['items'],
      }),
    )
    await visit('http://localhost/users/filtered', { only: ['items'] })

    expect(currentPage.get().layers![0].props).toEqual({ items: [1, 2, 3], filter: 'open' })
    expect(currentPage.get().layers![0].props).not.toHaveProperty('users')
    expect(currentPage.get().props).toEqual(expect.objectContaining({ users: [], items: [10] }))
  })
})

describe('per-layer optimistic updates', () => {
  const editLayer = (overrides: Partial<Page> = {}): Page =>
    pageWith({
      component: 'Users/Edit',
      url: '/users/5/edit',
      layer: { key: 'Users/Edit' },
      props: { user: { id: 5 }, todos: [1] },
      ...overrides,
    })

  const queueSettled = () => new Promise((resolve) => setTimeout(resolve))

  const visit = (url: string, options: VisitOptions = {}): Promise<Page> =>
    new Promise((resolve) => {
      const settle = () => resolve(currentPage.get())
      new Router().visit(url, { ...options, onSuccess: settle, onError: settle })
    })

  const open = async (): Promise<void> => {
    await hold(pageWith({ props: { users: [], todos: [10] } }))
    respondWith(editLayer())
    await visit('http://localhost/users/5/edit')
    await queueSettled()
  }

  beforeEach(() => {
    prefetchedRequests.removeAll()
  })

  afterEach(async () => {
    await queueSettled()
    vi.restoreAllMocks()
  })

  it('passes the layer props to a layer-targeted optimistic callback and writes the layer', async () => {
    await open()
    const layerId = currentPage.get().layers![0].id
    const received: unknown[] = []

    respondWith(editLayer({ props: { todos: [2] } }))
    router
      .optimistic((props) => {
        received.push(props.todos)
        return { todos: [...(props.todos as number[]), 9] }
      })
      .visit('http://localhost/users/5/edit', { layerId })
    await queueSettled()

    expect(received).toEqual([[1]])
    expect(currentPage.get().layers![0].props).toEqual(expect.objectContaining({ todos: [2] }))
    expect(currentPage.get().props).toEqual(expect.objectContaining({ todos: [10] }))
  })

  it('rolls a failed layer optimistic back into the layer, never the base', async () => {
    await open()
    const layerId = currentPage.get().layers![0].id

    let release!: () => void
    const held = new Promise<void>((resolve) => (release = resolve))
    http.setClient({
      request: async () => {
        await held
        return { status: 500, data: 'boom', headers: {} }
      },
    })
    router
      .optimistic((props) => ({ todos: [...(props.todos as number[]), 9] }))
      .visit('http://localhost/users/5/edit', { layerId, onError: () => {}, onSuccess: () => {} })
    await new Promise((resolve) => setTimeout(resolve))

    expect(currentPage.get().layers![0].props).toEqual(expect.objectContaining({ todos: [1, 9] }))
    expect(currentPage.get().props).toEqual(expect.objectContaining({ todos: [10] }))

    release()
    await queueSettled()

    expect(currentPage.get().layers![0].props).toEqual(expect.objectContaining({ todos: [1] }))
    expect(currentPage.get().props).toEqual(expect.objectContaining({ todos: [10] }))
  })

  it('never injects a pending base optimistic into a landing layer response', async () => {
    await open()
    const layerId = currentPage.get().layers![0].id

    let releaseBase!: () => void
    const baseHeld = new Promise<void>((resolve) => (releaseBase = resolve))
    http.setClient({
      request: async (config) => {
        if (config.url.includes('/users/5/edit')) {
          return {
            status: 200,
            data: editLayer({ props: { todos: [2] } }) as unknown as string,
            headers: { 'x-inertia': 'true' },
          }
        }
        await baseHeld
        return {
          status: 200,
          data: pageWith({ props: { users: [], todos: [10, 9] } }) as unknown as string,
          headers: { 'x-inertia': 'true' },
        }
      },
    })

    router.optimistic((props) => ({ todos: [...(props.todos as number[]), 9] })).reload()
    await new Promise((resolve) => setTimeout(resolve))
    expect(currentPage.get().props).toEqual(expect.objectContaining({ todos: [10, 9] }))

    await visit('http://localhost/users/5/edit', { layerId, only: ['todos'] })
    await queueSettled()

    expect(currentPage.get().layers![0].props).toEqual(expect.objectContaining({ todos: [2] }))
    expect(currentPage.get().props).toEqual(expect.objectContaining({ todos: [10, 9] }))

    releaseBase()
  })

  it('drops a closed layer optimistic state instead of rolling it into the base', async () => {
    await hold(pageWith({ props: { users: [], todos: [10] } }))
    await currentPage.set(
      composeColdLayer(
        pageWith({
          component: 'Users/Edit',
          url: '/users/5/edit',
          layer: { key: 'Users/Edit', base: '/users' },
          props: { user: { id: 5 }, todos: [1] },
        }),
        nextLayerId(pageWith()),
      ),
      { preservesBase: true },
    )
    const layerId = currentPage.get().layers![0].id

    let releaseLayer!: () => void
    const layerHeld = new Promise<void>((resolve) => (releaseLayer = resolve))
    http.setClient({
      request: async () => {
        await layerHeld
        return { status: 200, data: editLayer() as unknown as string, headers: { 'x-inertia': 'true' } }
      },
    })
    router
      .optimistic((props) => ({ todos: [...(props.todos as number[]), 9] }))
      .visit('http://localhost/users/5/edit', { layerId, onError: () => {}, onSuccess: () => {} })
    await new Promise((resolve) => setTimeout(resolve))

    await layerClosing.close(layerId)
    await layerClosing.closed(layerId)
    await queueSettled()

    expect(currentPage.pendingOptimisticCount()).toBe(0)
    expect(currentPage.get()).not.toHaveProperty('layers')
    expect(currentPage.get().props).not.toHaveProperty('todos')

    releaseLayer()
  })
})

describe('a reload or partial issued from inside a layer', () => {
  const inertiaResponse = (page: Page): HttpResponse => ({
    status: 200,
    data: page as unknown as string,
    headers: { 'x-inertia': 'true' },
  })

  const queueSettled = () => new Promise((resolve) => setTimeout(resolve))

  const openWarm = async (layerUrl = '/users/5/edit'): Promise<LayerState> => {
    await hold(pageWith())
    http.setClient({ request: async () => inertiaResponse(editLayer({ url: layerUrl })) })
    await new Promise<void>((resolve) => {
      new Router().visit(`http://localhost${layerUrl}`, { onSuccess: () => resolve(), onError: () => resolve() })
    })
    await queueSettled()
    return currentPage.get().layers![0]
  }

  const address = window.location.href

  afterEach(async () => {
    window.location.href = address
    await queueSettled()
    vi.restoreAllMocks()
  })

  it("re-asks for the layer's own url when the reload carries the layer's id", async () => {
    const layer = await openWarm()
    const requested: string[] = []

    http.setClient({
      request: ({ url }) => {
        requested.push(new URL(url).pathname)
        return Promise.resolve(inertiaResponse(editLayer()))
      },
    })

    await new Promise<void>((resolve) => {
      new Router().reload({ layerId: layer.id, only: ['user'], onSuccess: () => resolve(), onError: () => resolve() })
    })

    expect(requested).toEqual(['/users/5/edit'])
  })

  it('discards a reload the layer moved on from while it was in flight', async () => {
    const layer = await openWarm()
    const held = holding()

    const reloaded = new Promise<void>((resolve) => {
      new Router().reload({ layerId: layer.id, onSuccess: () => resolve(), onError: () => resolve() } as VisitOptions)
    })
    await vi.waitFor(() => expect(held()).not.toBeNull())
    const stale = held()!

    http.setClient({
      request: async () => inertiaResponse(editLayer({ url: '/users/6/edit', props: { user: { id: 6 } } })),
    })
    await new Promise<void>((resolve) => {
      new Router().visit('http://localhost/users/6/edit', { onSuccess: () => resolve(), onError: () => resolve() })
    })
    await queueSettled()

    stale(inertiaResponse(editLayer({ url: '/users/5/edit', props: { user: { id: 5 } } })))
    await reloaded
    await queueSettled()

    expect(currentPage.get().layers!.map((open) => open.url)).toEqual(['/users/6/edit'])
    expect(currentPage.get().layers![0].props.user).toEqual({ id: 6 })
  })

  it('keeps a reload of a layer that stayed where it was while it was in flight', async () => {
    const layer = await openWarm()
    const held = holding()

    const reloaded = new Promise<void>((resolve) => {
      new Router().reload({ layerId: layer.id, onSuccess: () => resolve(), onError: () => resolve() } as VisitOptions)
    })
    await vi.waitFor(() => expect(held()).not.toBeNull())

    held()!(inertiaResponse(editLayer({ url: '/users/5/edit', props: { user: { id: 5, seen: 1 } } })))
    await reloaded
    await queueSettled()

    expect(currentPage.get().layers![0].props.user).toEqual({ id: 5, seen: 1 })
  })

  it('keeps the identity of the props a response left untouched, reading them off the layer', async () => {
    const layer = await openWarm()
    const untouched = layer.props.user

    http.setClient({
      request: async () => inertiaResponse(editLayer({ props: { user: { id: 5 } } })),
    })

    await new Promise<void>((resolve) => {
      new Router().visit('http://localhost/users/5/edit', { onSuccess: () => resolve(), onError: () => resolve() })
    })

    expect(currentPage.get().layers![0].props.user).toBe(untouched)
  })

  it('keeps the identity of the props a base response left untouched', async () => {
    await hold(pageWith({ props: { users: [{ id: 1 }], team: { id: 7 } } }))
    const untouched = currentPage.get().props.team

    http.setClient({
      request: async () => inertiaResponse(pageWith({ props: { users: [{ id: 2 }], team: { id: 7 } } })),
    })

    await new Promise<void>((resolve) => {
      new Router().visit('http://localhost/users', { onSuccess: () => resolve(), onError: () => resolve() })
    })

    expect(currentPage.get().props.team).toBe(untouched)
    expect(currentPage.get().props.users).toEqual([{ id: 2 }])
  })

  it('never takes the identity of a base prop that happens to equal the layer prop', async () => {
    await hold(pageWith({ component: 'Users/Edit', props: { user: { id: 5 } } }))
    http.setClient({ request: async () => inertiaResponse(editLayer({ component: 'Users/Edit' })) })

    await new Promise<void>((resolve) => {
      new Router().visit('http://localhost/users/5/edit', { onSuccess: () => resolve(), onError: () => resolve() })
    })
    await queueSettled()

    expect(currentPage.get().layers![0].props.user).not.toBe(currentPage.get().props.user)
    expect(currentPage.get().layers![0].props.user).toEqual({ id: 5 })
  })

  it('a bare reload re-asks for the base beneath the stack, not the address', async () => {
    const layer = await openWarm()
    window.location.href = 'http://localhost/users/5/edit'
    const requested: string[] = []

    http.setClient({
      request: ({ url }) => {
        requested.push(new URL(url).pathname)
        return Promise.resolve(inertiaResponse(pageWith({ props: { users: [{ id: 9 }] } })))
      },
    })

    await new Promise<void>((resolve) => {
      new Router().reload({ onSuccess: () => resolve(), onError: () => resolve() })
    })

    expect(requested).toEqual(['/users'])
    expect(currentPage.get().layers).toEqual([expect.objectContaining({ id: layer.id })])
  })

  it('names the layer in X-Inertia-Partial-Component when the reload carries the layer id', async () => {
    const layer = await openWarm()
    let partialComponent: string | undefined

    http.setClient({
      request: ({ headers }) => {
        partialComponent = (headers ?? {})['X-Inertia-Partial-Component']
        return Promise.resolve(inertiaResponse(editLayer()))
      },
    })

    await new Promise<void>((resolve) => {
      new Router().reload({ layerId: layer.id, only: ['user'], onSuccess: () => resolve(), onError: () => resolve() })
    })

    expect(partialComponent).toBe('Users/Edit')
  })

  it('drops the carried target for a url-less layer and reloads the base beneath the stack', async () => {
    await hold(pageWith())
    const id = nextLayerId(currentPage.get())
    await currentPage.set(
      composeLayer(
        currentPage.get(),
        pageWith({
          component: 'Users/Edit',
          url: '/users/5/edit',
          layer: { key: 'Users/Edit' },
          props: { user: { id: 5 } },
        }) as Page,
        id,
        { url: null, owner: currentPage.id() },
      ),
      { preservesBase: true },
    )
    await queueSettled()

    const requested: string[] = []
    let partialComponent: string | undefined
    http.setClient({
      request: ({ url, headers }) => {
        requested.push(new URL(url).pathname)
        partialComponent = (headers ?? {})['X-Inertia-Partial-Component']
        return Promise.resolve(inertiaResponse(pageWith({ props: { users: [{ id: 9 }] } })))
      },
    })

    await new Promise<void>((resolve) => {
      new Router().reload({ layerId: id, only: ['users'], onSuccess: () => resolve(), onError: () => resolve() })
    })

    expect(requested).toEqual(['/users'])
    expect(partialComponent).toBe('Users/Index')
    expect(currentPage.get().layers).toEqual([expect.objectContaining({ id })])
  })

  it('drops the target for a url-less layer reloading through its own router', async () => {
    await hold(composeLocalLayer(pageWith(), 'Users/Preview', {}, 'local', currentPage.id()))

    const requested: string[] = []
    let partialComponent: string | undefined
    http.setClient({
      request: ({ url, headers }) => {
        requested.push(new URL(url).pathname)
        partialComponent = (headers ?? {})['X-Inertia-Partial-Component']

        return Promise.resolve(inertiaResponse(pageWith({ props: { users: [{ id: 9 }] } })))
      },
    })

    await new Promise<void>((resolve) => {
      new Router('local').reload({ only: ['users'], onSuccess: () => resolve(), onError: () => resolve() })
    })

    expect(requested).toEqual(['/users'])
    expect(partialComponent).toBe('Users/Index')
    expect(currentPage.get().layers).toEqual([expect.objectContaining({ id: 'local' })])
  })

  it('strips the layer target from the request a 409 redirect re-issues', async () => {
    const layer = await openWarm()
    const requested: string[] = []
    const partialComponents: (string | undefined)[] = []

    http.setClient({
      request: ({ url, headers }) => {
        requested.push(new URL(url).pathname)
        partialComponents.push((headers ?? {})['X-Inertia-Partial-Component'])

        return requested.length === 1
          ? Promise.resolve({
              status: 409,
              data: '',
              headers: { 'x-inertia-redirect': 'http://localhost/users' },
            } as HttpResponse)
          : Promise.resolve(inertiaResponse(pageWith({ props: { users: [{ id: 9 }] } })))
      },
    })

    new Router().reload({ layerId: layer.id, only: ['users'] })
    await vi.waitFor(() => expect(requested).toHaveLength(2))

    expect(requested).toEqual(['/users/5/edit', '/users'])
    expect(partialComponents[1]).toBe('Users/Index')
    expect(currentPage.get().layers).toEqual([expect.objectContaining({ id: layer.id })])
    expect(currentPage.get().layers![0].props).toEqual({ user: { id: 5 } })
  })

  it('a visit to the page does not cancel an in-flight request aimed at a layer', async () => {
    await hold(pageWith())
    const id = nextLayerId(currentPage.get())
    await currentPage.set(
      composeLayer(
        currentPage.get(),
        pageWith({
          component: 'Users/Edit',
          url: '/users',
          layer: { key: 'Users/Edit' },
          props: { user: { id: 5 } },
        }) as Page,
        id,
        { url: '/users', owner: currentPage.id() },
      ),
      { preservesBase: true },
    )
    await queueSettled()

    const released: string[] = []
    http.setClient({
      request: ({ url }) => {
        const path = new URL(url).pathname
        released.push(path)
        return path === '/dashboard'
          ? Promise.resolve(inertiaResponse(pageWith({ component: 'Dashboard', url: '/dashboard' })))
          : new Promise<HttpResponse>(() => {})
      },
    })

    let layerPartialCancelled = false
    router.visit('http://localhost/users', {
      layerId: id,
      only: ['user'],
      async: true,
      onCancel: () => (layerPartialCancelled = true),
    })
    await vi.waitFor(() => expect(released).toContain('/users'))

    await new Promise<void>((resolve) => {
      router.visit('http://localhost/dashboard', { onSuccess: () => resolve(), onError: () => resolve() })
    })

    expect(layerPartialCancelled).toBe(false)
  })

  it("a reload aimed at a layer does not cancel the page's pending load", async () => {
    const layer = await openWarm()
    const released: string[] = []

    http.setClient({
      request: ({ url }) => {
        const path = new URL(url).pathname
        released.push(path)
        return path === '/users/5/edit'
          ? Promise.resolve(inertiaResponse(editLayer()))
          : new Promise<HttpResponse>(() => {})
      },
    })

    let basePendingCancelled = false
    router.reload({ only: ['users'], onCancel: () => (basePendingCancelled = true) })
    await vi.waitFor(() => expect(released).toContain('/users'))

    router.reload({ layerId: layer.id, only: ['user'] })
    await vi.waitFor(() => expect(released).toContain('/users/5/edit'))

    expect(basePendingCancelled).toBe(false)
  })

  it('discards a layer response whose layer closed while the request was in flight', async () => {
    const layer = await openWarm()
    let answer!: (response: HttpResponse) => void

    http.setClient({
      request: ({ url }) =>
        new URL(url).pathname === '/users/5/edit'
          ? new Promise<HttpResponse>((resolve) => (answer = resolve))
          : Promise.resolve(inertiaResponse(pageWith())),
    })

    new Router().reload({ layerId: layer.id, only: ['user'] })
    await vi.waitFor(() => expect(answer).toBeDefined())

    const closing = router.close(layer.id)
    await queueSettled()
    eventHandler.init()
    listeners.get('popstate')!({ state: { page: pageWith() } } as PopStateEvent)
    await closing
    await queueSettled()

    answer(inertiaResponse(editLayer()))
    await queueSettled()

    expect(currentPage.get().component).toBe('Users/Index')
    expect(currentPage.get().layers).toBeUndefined()
  })

  it('discards a response whose standalone layer closed, rather than reopening it over the page', async () => {
    await hold(pageWith())
    const id = nextLayerId(currentPage.get())
    await currentPage.set(composeColdLayer(editLayer({ layer: { key: 'Users/Edit', base: '/users' } }), id), {
      preservesBase: true,
    })
    await queueSettled()

    let answer!: (response: HttpResponse) => void
    http.setClient({ request: () => new Promise<HttpResponse>((resolve) => (answer = resolve)) })

    new Router().reload({ layerId: id, only: ['user'] })
    await vi.waitFor(() => expect(answer).toBeDefined())

    await router.close(id)
    await queueSettled()
    expect(currentPage.get().layers).toBeUndefined()

    answer(inertiaResponse(editLayer({ layer: { key: 'Users/Edit', base: '/users' } })))
    await queueSettled()

    expect(currentPage.get().layers).toBeUndefined()
  })

  it('installs a page response for a visit whose layer closed, since it is a navigation', async () => {
    const layer = await openWarm()
    let answer!: (response: HttpResponse) => void

    http.setClient({
      request: ({ url }) =>
        new URL(url).pathname === '/users/5/edit'
          ? new Promise<HttpResponse>((resolve) => (answer = resolve))
          : Promise.resolve(inertiaResponse(pageWith())),
    })

    new Router().visit('http://localhost/users/5/edit', { layerId: layer.id })
    await vi.waitFor(() => expect(answer).toBeDefined())

    const closing = router.close(layer.id)
    await queueSettled()
    eventHandler.init()
    listeners.get('popstate')!({ state: { page: pageWith() } } as PopStateEvent)
    await closing
    await queueSettled()

    answer(inertiaResponse(pageWith({ component: 'Dashboard', url: '/dashboard' })))
    await queueSettled()

    expect(currentPage.get().component).toBe('Dashboard')
  })
})

describe('an instant visit that opens a layer or is made from one', () => {
  const client = http.getClient()

  const openOn = async (layer: Partial<Page> = {}) => {
    await hold(composeLayer(pageWith(), editLayer(layer), 'layer-1'))

    return currentPage.get().layers![0]
  }

  const holdTheRequest = () => http.setClient({ request: () => new Promise(() => {}) })

  afterEach(() => {
    http.setClient(client)
    layerClosing.settleUnwind()
    vi.restoreAllMocks()
  })

  it('rewrites the layer where it stands rather than fabricating a page over the stack', async () => {
    const open = await openOn()
    holdTheRequest()

    router.visit('/users/9/edit', { component: 'Users/Edit', layerId: open.id } as VisitOptions)
    await new Promise((resolve) => setTimeout(resolve))

    const page = currentPage.get()

    expect(page.component).toBe('Users/Index')
    expect(page.props).toEqual({ users: [] })
    expect(page.layers).toHaveLength(1)
    expect(page.layers![0].id).toBe(open.id)
    expect(page.layers![0].component).toBe('Users/Edit')
    expect(page.layers![0].url).toBe('/users/9/edit')
  })

  it('leaves the base its identity, so the response it fetched still composes onto the stack', async () => {
    const open = await openOn()
    const generation = currentPage.generation()
    const baseId = currentPage.id()
    holdTheRequest()

    router.visit('/users/9/edit', { component: 'Users/Edit', layerId: open.id } as VisitOptions)
    await new Promise((resolve) => setTimeout(resolve))

    expect(currentPage.generation()).toBe(generation)
    expect(currentPage.id()).toBe(baseId)
  })

  it('does not fire the onClose of the layer it is swapping', async () => {
    const open = await openOn()
    let closed = false
    router.layerHandle(open.id).onClose(() => (closed = true))
    holdTheRequest()

    router.visit('/users/9/edit', { component: 'Users/Edit', layerId: open.id } as VisitOptions)
    await new Promise((resolve) => setTimeout(resolve))

    expect(closed).toBe(false)
  })

  it('drops the record the layer was showing rather than carrying it into the placeholder', async () => {
    const open = await openOn({
      props: { user: { id: 5 } },
      deferredProps: { default: ['history'] },
      onceProps: { token: { prop: 'token' } },
      scrollProps: { items: { pageName: 'page' } },
      rescuedProps: ['history'],
      flash: { message: 'Saved' },
    } as Partial<Page>)
    holdTheRequest()

    router.visit('/users/9/edit', { component: 'Users/Edit', layerId: open.id } as VisitOptions)
    await new Promise((resolve) => setTimeout(resolve))

    const [swapped] = currentPage.get().layers!

    expect(swapped.props).toEqual({ errors: {} })
    expect(swapped.deferredProps).toEqual({})
    expect(swapped.onceProps).toEqual({})
    expect(swapped.scrollProps).toEqual({})
    expect(swapped.rescuedProps).toEqual([])
    expect(swapped.flash).toEqual({})
  })

  it('remakes the layer component for the record it is heading to', async () => {
    const open = await openOn()
    holdTheRequest()

    router.visit('/users/9/edit', { component: 'Users/Edit', layerId: open.id } as VisitOptions)
    await new Promise((resolve) => setTimeout(resolve))

    expect(currentPage.get().layers![0].renderKey).not.toBe(open.renderKey)
  })

  it('lands a response keyed differently on the placeholder rather than beside it', async () => {
    // The server keys this layer per record, so the key the response carries is not one the
    // placeholder could have been given when it went up.
    const open = await openOn({ layer: { key: 'panel:first' } } as Partial<Page>)
    const answer = holding()

    router.visit('/layers/panel/second', { component: 'Layers/Panel', layerId: open.id } as VisitOptions)
    await vi.waitFor(() => expect(answer()).not.toBeNull())

    answer()!({
      status: 200,
      data: editLayer({
        component: 'Layers/Panel',
        url: '/layers/panel/second',
        layer: { key: 'panel:second' },
        props: { name: 'second' },
      }),
      headers: { 'x-inertia': 'true' },
    })

    await vi.waitFor(() => expect(currentPage.get().layers![0].key).toBe('panel:second'))

    const page = currentPage.get()

    expect(page.layers).toHaveLength(1)
    expect(page.layers![0].id).toBe(open.id)
    expect(page.layers![0].props).toEqual({ name: 'second' })
  })

  it('stacks a response under a different key as a new layer when no placeholder was fabricated', async () => {
    const open = await openOn({ layer: { key: 'panel:first' } } as Partial<Page>)

    respondWith(
      editLayer({
        component: 'Layers/Panel',
        url: '/layers/panel/second',
        layer: { key: 'panel:second' },
        props: { name: 'second' },
      }),
    )

    router.visit('/layers/panel/second', { layerId: open.id } as VisitOptions)
    await vi.waitFor(() => expect(currentPage.get().layers).toHaveLength(2))

    expect(currentPage.get().layers!.map((layer) => layer.key)).toEqual(['panel:first', 'panel:second'])
  })

  it('lands the response on the layer it fabricated, keeping its component instance', async () => {
    const open = await openOn()
    const answer = holding()

    router.visit('/users/9/edit', { component: 'Users/Edit', layerId: open.id } as VisitOptions)
    await vi.waitFor(() => expect(answer()).not.toBeNull())

    const fabricated = currentPage.get().layers![0]

    answer()!({
      status: 200,
      data: editLayer({ url: '/users/9/edit', props: { user: { id: 9 } } }),
      headers: { 'x-inertia': 'true' },
    })

    await vi.waitFor(() => expect(currentPage.get().layers![0].props).toEqual({ user: { id: 9 } }))

    const page = currentPage.get()

    expect(page.component).toBe('Users/Index')
    expect(page.layers).toHaveLength(1)
    expect(page.layers![0].id).toBe(open.id)
    expect(page.layers![0].renderKey).toBe(fabricated.renderKey)
  })

  it('puts the placeholder up as a layer, leaving the page it opens on where it is', async () => {
    await hold(pageWith())
    holdTheRequest()

    router.layer('/users/5/edit', { component: 'Users/Edit' } as VisitOptions)
    await new Promise((resolve) => setTimeout(resolve))

    const page = currentPage.get()

    expect(page.component).toBe('Users/Index')
    expect(page.url).toBe('/users')
    expect(page.layers).toHaveLength(1)
    expect(page.layers![0].component).toBe('Users/Edit')
    expect(page.layers![0].url).toBe('/users/5/edit')
    expect(page.layers![0].owner).toBe(currentPage.id())
  })

  it('lands the response on the placeholder an open put up, under the id it created', async () => {
    await hold(pageWith())
    const answer = holding()

    const handle = router.layer('/users/5/edit', { component: 'Users/Edit' } as VisitOptions)
    await vi.waitFor(() => expect(answer()).not.toBeNull())

    const fabricated = currentPage.get().layers![0]

    answer()!({ status: 200, data: editLayer(), headers: { 'x-inertia': 'true' } })
    await vi.waitFor(() => expect(currentPage.get().layers![0].props).toEqual({ user: { id: 5 } }))

    const page = currentPage.get()

    expect(page.component).toBe('Users/Index')
    expect(page.layers).toHaveLength(1)
    expect(page.layers![0].id).toBe(fabricated.id)
    expect(page.layers![0].id).toBe(handle.id)
    expect(page.layers![0].key).toBe('Users/Edit')
  })

  it('leaves the scroll of the page beneath alone', async () => {
    const open = await openOn()
    const reset = vi.spyOn(Scroll, 'reset')
    holdTheRequest()

    router.visit('/users/9/edit', { component: 'Users/Edit', layerId: open.id } as VisitOptions)
    await new Promise((resolve) => setTimeout(resolve))

    expect(reset).not.toHaveBeenCalled()
  })

  it('still resets the scroll when it fabricates a page', async () => {
    await openOn()
    const reset = vi.spyOn(Scroll, 'reset')
    holdTheRequest()

    router.visit('/users/9/edit', { component: 'Users/Edit' } as VisitOptions)
    await new Promise((resolve) => setTimeout(resolve))

    expect(reset).toHaveBeenCalled()
  })

  it('still fabricates a page when the visit names no layer', async () => {
    await openOn()
    holdTheRequest()

    router.visit('/users/9/edit', { component: 'Users/Edit' } as VisitOptions)
    await new Promise((resolve) => setTimeout(resolve))

    expect(currentPage.get().component).toBe('Users/Edit')
    expect(currentPage.get().layers).toBeUndefined()
  })

  it('falls back to fabricating a page when the layer it names has already closed', async () => {
    const open = await openOn()
    await currentPage.set(closeLayer(currentPage.get(), open.id), { preservesBase: true })
    holdTheRequest()

    router.visit('/users/9/edit', { component: 'Users/Edit', layerId: open.id } as VisitOptions)
    await new Promise((resolve) => setTimeout(resolve))

    expect(currentPage.get().component).toBe('Users/Edit')
    expect(currentPage.get().layers).toBeUndefined()
  })
})

describe('a close: true response runs the close flow instead of installing', () => {
  const queueSettled = () => new Promise((resolve) => setTimeout(resolve))

  const submit = (url: string, options: VisitOptions = {}): Promise<void> =>
    new Promise((resolve) => {
      new Router().visit(url, { ...options, method: 'post', onFinish: () => resolve() })
    })

  const openWarm = async (): Promise<void> => {
    await hold(pageWith())
    http.setClient({
      request: async () => ({ status: 200, data: editLayer() as unknown as string, headers: { 'x-inertia': 'true' } }),
    })
    await new Promise<void>((resolve) => {
      new Router().visit('http://localhost/users/5/edit', { onSuccess: () => resolve(), onError: () => resolve() })
    })
    await queueSettled()
  }

  beforeEach(() => {
    prefetchedRequests.removeAll()
  })

  afterEach(async () => {
    await queueSettled()
    layerClosing.settleUnwind()
    vi.restoreAllMocks()
  })

  it('runs the top-layer close flow when close: true arrives over an open layer, installing nothing', async () => {
    await openWarm()
    const [layer] = currentPage.get().layers!
    const go = vi.spyOn(window.history, 'go')
    const requested: string[] = []
    let answer: ((response: unknown) => void) | null = null
    http.setClient({
      request: ({ url }) => {
        requested.push(new URL(url).pathname)
        return new Promise((resolve) => (answer = resolve))
      },
    })

    const submitted = submit('http://localhost/users/5/edit')
    await vi.waitFor(() => expect(answer).not.toBeNull())
    answer!({
      status: 200,
      data: pageWith({ close: true, url: '/users/5/edit' }),
      headers: { 'x-inertia': 'true' },
    })
    await submitted

    expect(currentPage.get().component).toBe('Users/Index')
    expect(currentPage.get().url).toBe('/users')
    expect(currentPage.get().layers!.map((open) => open.id)).toEqual([layer.id])
    expect(currentPage.get()).not.toHaveProperty('close')

    layerClosing.closed(layer.id)
    await history.processQueue()
    expect(go).toHaveBeenCalledWith(-1)

    eventHandler.init()
    listeners.get('popstate')!({ state: { page: pageWith() } } as PopStateEvent)
    await vi.waitFor(() => expect(requested).toEqual(['/users/5/edit', '/users']))

    answer!({ status: 200, data: pageWith({ props: { users: [{ id: 9 }] } }), headers: { 'x-inertia': 'true' } })
    await vi.waitFor(() => expect(currentPage.get().props.users).toEqual([{ id: 9 }]))
    expect(currentPage.get()).not.toHaveProperty('layers')
  })

  it('reports the submit as a success, since nothing about it failed', async () => {
    await openWarm()
    let succeeded = false
    let errored = false
    http.setClient({
      request: async () => ({
        status: 200,
        data: pageWith({ close: true, url: '/users/5/edit' }) as unknown as string,
        headers: { 'x-inertia': 'true' },
      }),
    })

    await submit('http://localhost/users/5/edit', {
      onSuccess: () => {
        succeeded = true
      },
      onError: () => {
        errored = true
      },
    })

    expect(succeeded).toBe(true)
    expect(errored).toBe(false)
  })

  it('hands the success callbacks the page as the close leaves it, not the one still showing the layer', async () => {
    await openWarm()
    const [lower] = currentPage.get().layers!
    await currentPage.set(
      composeLayer(
        currentPage.get(),
        pageWith({ component: 'Users/Notes', url: '/users/5/notes', layer: { key: 'Users/Notes' } }),
        'layer-notes',
      ),
      { preservesBase: true },
    )
    let answer: ((response: unknown) => void) | null = null
    http.setClient({ request: () => new Promise((resolve) => (answer = resolve)) })

    let received: Page | null = null
    const submitted = new Promise<void>((resolve) => {
      new Router('layer-notes').visit('http://localhost/users/5/notes', {
        method: 'post',
        onSuccess: (page) => {
          received = page
        },
        onFinish: () => resolve(),
      })
    })
    await vi.waitFor(() => expect(answer).not.toBeNull())
    answer!({ status: 200, data: pageWith({ close: true, url: '/users/5/notes' }), headers: { 'x-inertia': 'true' } })
    await submitted

    expect(received!.layers!.map((layer: LayerState) => layer.id)).toEqual([lower.id])
  })

  it('closes the layer the visit was made from, and every layer above it', async () => {
    await openWarm()
    const [lower] = currentPage.get().layers!
    await currentPage.set(
      composeLayer(
        currentPage.get(),
        pageWith({ component: 'Users/Notes', url: '/users/5/notes', layer: { key: 'Users/Notes' } }),
        'layer-notes',
      ),
      { preservesBase: true },
    )
    const go = vi.spyOn(window.history, 'go')
    let answer: ((response: unknown) => void) | null = null
    http.setClient({ request: () => new Promise((resolve) => (answer = resolve)) })

    const submitted = new Promise<void>((resolve) => {
      new Router(lower.id).visit('http://localhost/users/5/edit', { method: 'post', onFinish: () => resolve() })
    })
    await vi.waitFor(() => expect(answer).not.toBeNull())
    answer!({
      status: 200,
      data: pageWith({ close: true, url: '/users/5/edit' }),
      headers: { 'x-inertia': 'true' },
    })
    await submitted

    await vi.waitFor(() => expect(go).toHaveBeenCalledWith(-2))
  })

  it('closes nothing when the layer the visit was made from has gone since', async () => {
    await openWarm()
    const [gone] = currentPage.get().layers!
    let answer: ((response: unknown) => void) | null = null
    http.setClient({ request: () => new Promise((resolve) => (answer = resolve)) })

    const submitted = submit('http://localhost/users/5', { layerId: gone.id } as VisitOptions)
    await vi.waitFor(() => expect(answer).not.toBeNull())

    await currentPage.set(closeLayer(currentPage.get(), gone.id), { preservesBase: true })
    await currentPage.set(
      composeLayer(
        currentPage.get(),
        pageWith({ component: 'Users/Notes', url: '/users/5/notes', layer: { key: 'Users/Notes' } }),
        'layer-notes',
      ),
      { preservesBase: true },
    )

    const go = vi.spyOn(window.history, 'go')

    answer!({ status: 200, data: pageWith({ close: true }), headers: { 'x-inertia': 'true' } })
    await submitted
    await queueSettled()

    expect(go).not.toHaveBeenCalled()
    expect(currentPage.get().layers!.map((layer) => layer.id)).toEqual(['layer-notes'])
  })

  it('refreshes the current page when close: true arrives with no layer open', async () => {
    await hold(pageWith({ props: { stats: [1] } }))
    const requested: string[] = []
    let answer: ((response: unknown) => void) | null = null
    http.setClient({
      request: ({ url }) => {
        requested.push(new URL(url).pathname)
        return new Promise((resolve) => (answer = resolve))
      },
    })

    const submitted = submit('http://localhost/users')
    await vi.waitFor(() => expect(answer).not.toBeNull())
    answer!({
      status: 200,
      data: JSON.stringify(pageWith({ close: true, props: { stats: [9, 9, 9] } })),
      headers: { 'x-inertia': 'true' },
    })
    await submitted

    expect(currentPage.get()).not.toHaveProperty('close')
    expect(currentPage.get().props).toEqual({ stats: [1] })

    await vi.waitFor(() => expect(requested).toEqual(['/users', '/users']))
    answer!({ status: 200, data: pageWith({ props: { users: [{ id: 9 }] } }), headers: { 'x-inertia': 'true' } })
    await vi.waitFor(() => expect(currentPage.get().props).toEqual(expect.objectContaining({ users: [{ id: 9 }] })))
  })
})

describe('a submit answered by the tier the layer stands on', () => {
  const openLocal = async (): Promise<string> => {
    await hold(pageWith())

    const handle = router.layer({ component: 'Users/Confirm', props: { user: 5 } })

    await new Promise((resolve) => setTimeout(resolve))

    return handle.id
  }

  const openLocalOverALayer = async (): Promise<[string, string]> => {
    await hold(pageWith())

    respondWith(editLayer())
    await new Promise<void>((resolve) => router.visit('http://localhost/users/5/edit', { onSuccess: () => resolve() }))

    const handle = router.layer({ component: 'Users/Confirm', props: { user: 5 } })

    await new Promise((resolve) => setTimeout(resolve))

    return [currentPage.get().layers![0].id, handle.id]
  }

  const submit = (layerId: string): Promise<Errors> =>
    new Promise((resolve) => {
      router.post('http://localhost/users', {}, {
        layerId,
        onError: resolve,
        onSuccess: () => resolve({}),
      } as VisitOptions)
    })

  afterEach(async () => {
    await new Promise((resolve) => setTimeout(resolve))
    layerClosing.settleUnwind()
  })

  it('keeps a local layer up and gives it the errors the server handed back', async () => {
    const layerId = await openLocal()
    respondWith(pageWith({ props: { users: [], errors: { name: 'The name is required.' } } }))

    const announced = await submit(layerId)

    expect(announced).toEqual({ name: 'The name is required.' })
    expect(currentPage.get().layers!.map((layer) => layer.id)).toEqual([layerId])
    expect(currentPage.get().layers![0].props.errors).toEqual({ name: 'The name is required.' })
    expect(currentPage.get().props.errors).toEqual({})
  })

  it('hands the flash back to the layer along with the errors', async () => {
    const layerId = await openLocal()
    respondWith(
      pageWith({ props: { users: [], errors: { name: 'Required.' } }, flash: { message: 'Check the form.' } }),
    )

    const flashes: unknown[] = []

    await new Promise<void>((resolve) => {
      router.post('http://localhost/users', {}, {
        layerId,
        onFlash: (flash) => flashes.push(flash),
        onError: () => resolve(),
        onSuccess: () => resolve(),
      } as VisitOptions)
    })

    expect(flashes).toEqual([{ message: 'Check the form.' }])
    expect(currentPage.get().layers![0].flash).toEqual({ message: 'Check the form.' })
    expect(currentPage.get().flash).toEqual({})
  })

  it('clears the stack when the same submit comes back without errors', async () => {
    const layerId = await openLocal()
    respondWith(pageWith({ props: { users: [{ id: 9 }] } }))

    await submit(layerId)

    expect(currentPage.get().layers).toBeUndefined()
    expect(currentPage.get().props).toEqual({ users: [{ id: 9 }] })
  })

  it('clears the stack when the errors come back on another page altogether', async () => {
    const layerId = await openLocal()
    respondWith(pageWith({ component: 'Users/Create', url: '/users/create', props: { errors: { name: 'Required.' } } }))

    await submit(layerId)

    expect(currentPage.get().layers).toBeUndefined()
    expect(currentPage.get().component).toBe('Users/Create')
  })

  it('keeps a local layer up when the address it was submitted from belongs to the layer beneath it', async () => {
    const [editId, layerId] = await openLocalOverALayer()
    respondWith(editLayer({ props: { user: { id: 5 }, errors: { name: 'The name is required.' } } }))

    const announced = await submit(layerId)

    expect(announced).toEqual({ name: 'The name is required.' })
    expect(currentPage.get().layers!.map((layer) => layer.id)).toEqual([editId, layerId])
    expect(currentPage.get().layers![1].props.errors).toEqual({ name: 'The name is required.' })
    expect(currentPage.get().layers![0].props.errors).toEqual({})
  })

  it('closes the local layer when the errors come back from another url of that layer', async () => {
    const [editId, layerId] = await openLocalOverALayer()
    respondWith(editLayer({ url: '/users/6/edit', props: { user: { id: 6 }, errors: { name: 'Required.' } } }))

    await submit(layerId)

    expect(currentPage.get().layers!.map((layer) => layer.id)).toEqual([editId])
    expect(currentPage.get().layers![0].props.errors).toEqual({ name: 'Required.' })
  })
})
