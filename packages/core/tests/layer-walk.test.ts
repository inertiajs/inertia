import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { router } from '../src'
import dialog from '../src/dialog'
import { eventHandler } from '../src/eventHandler'
import { history } from '../src/history'
import { http } from '../src/http'
import { HttpNetworkError, HttpResponseError } from '../src/httpErrors'
import { InitialVisit } from '../src/initialVisit'
import { layerClosing } from '../src/layers'
import { composeLayer, maxLayerChain, resolveInitialPage } from '../src/layers'
import { page as currentPage } from '../src/page'
import { prefetchedRequests } from '../src/prefetched'
import { Router } from '../src/router'
import { SessionStorage } from '../src/sessionStorage'
import { HttpRequestHeaders, HttpResponse, Page, PageHandler, VisitOptions } from '../src/types'
import { listeners } from './support/browser'
import { marked, pageWith } from './support/layers'

describe('the walk a cold layer sends for the base beneath it', () => {
  const loginPage = pageWith({ component: 'Auth/Login', url: '/login' })

  const layerAt = (url: string, component: string, base?: string): Page =>
    pageWith({ component, url, layer: { key: component, base }, props: {} })

  const hold = async (page: Page, swapComponent: PageHandler<never> = async () => {}): Promise<void> => {
    currentPage.init({
      initialPage: page,
      resolveComponent: (name) => ({ name }) as never,
      swapComponent,
    })

    await currentPage.setQuietly(page)
  }

  const swapping = (swaps: { component: string; preserveState: boolean }[]): PageHandler<never> =>
    (async ({ component, preserveState }) =>
      swaps.push({
        component: (component as { name: string } | undefined)?.name ?? '',
        preserveState,
      })) as PageHandler<never>

  const held = new Map<string, { resolve: (response: HttpResponse) => void; reject: (error: Error) => void }>()

  const sent = new Map<string, HttpRequestHeaders>()

  const inertiaResponse = (page: Page): HttpResponse => ({
    status: 200,
    data: page as unknown as string,
    headers: { 'x-inertia': 'true' },
  })

  const errorPage: HttpResponse = { status: 500, data: '<html>Server Error</html>', headers: {} }

  const answering = (pages: Record<string, Page>): string[] => {
    const requested: string[] = []

    http.setClient({
      request: ({ url, headers }) => {
        const path = new URL(url).pathname
        requested.push(path)
        sent.set(path, headers ?? {})

        return pages[path]
          ? Promise.resolve(inertiaResponse(pages[path]))
          : new Promise<HttpResponse>((resolve, reject) => held.set(path, { resolve, reject }))
      },
    })

    return requested
  }

  const answer = (path: string, page: Page): Promise<void> => {
    held.get(path)!.resolve(inertiaResponse(page))

    return new Promise((resolve) => setTimeout(resolve))
  }

  const refuse = (path: string, error: Error): Promise<void> => {
    held.get(path)!.reject(error)

    return new Promise((resolve) => setTimeout(resolve))
  }

  const refuseWith = (path: string, response: HttpResponse): Promise<void> => {
    held.get(path)!.resolve(response)

    return new Promise((resolve) => setTimeout(resolve))
  }

  const openCold = (options: VisitOptions = {}): Promise<Page> =>
    new Promise((resolve) => {
      const settle = () => resolve(currentPage.get())

      new Router().visit('http://localhost/login', { method: 'post', ...options, onSuccess: settle, onError: settle })
    })

  const walked = (component: string) => vi.waitFor(() => expect(currentPage.get().component).toBe(component))

  const address = window.location.href
  const client = http.getClient()

  const waitingForTheHop = async (): Promise<void> => {
    await vi.waitFor(() => expect(held.has('/users')).toBe(true))
    await new Promise((resolve) => setTimeout(resolve))
  }

  beforeEach(() => {
    held.clear()
    sent.clear()
    prefetchedRequests.removeAll()
  })

  afterEach(() => {
    window.location.href = address
    http.setClient(client)
    vi.restoreAllMocks()
  })

  it('opens the layer over a base that has not arrived yet', async () => {
    await hold(loginPage)
    answering({ '/login': layerAt('/users/5/edit', 'Users/Edit', '/users') })

    const page = await openCold()

    expect(page.component).toBe('')
    expect(page.url).toBe('/users')
    expect(page.layers).toEqual([
      expect.objectContaining({ key: 'Users/Edit', url: '/users/5/edit', base: '/users', standalone: true }),
    ])
  })

  it("writes the layer's address before the base beneath it has been fetched", async () => {
    await hold(loginPage)
    answering({ '/login': layerAt('/users/5/edit', 'Users/Edit', '/users') })
    const pushState = vi.spyOn(window.history, 'pushState')

    await openCold()
    await history.processQueue()

    expect(pushState).toHaveBeenCalledWith(expect.anything(), '', '/users/5/edit')
  })

  it('keeps the address on the top layer even when the visit asked to preserve the url', async () => {
    await hold(loginPage)
    answering({ '/login': layerAt('/users/5/edit', 'Users/Edit', '/users') })
    const pushState = vi.spyOn(window.history, 'pushState')

    const page = await openCold({ preserveUrl: true })
    await history.processQueue()

    expect(page.layers).toEqual([expect.objectContaining({ key: 'Users/Edit', url: '/users/5/edit' })])
    expect(pushState).toHaveBeenCalledWith(expect.anything(), '', '/users/5/edit')
  })

  it('resolves a two-deep cold open in three requests, top down', async () => {
    await hold(loginPage)
    const requested = answering({
      '/login': layerAt('/users/5/edit', 'Users/Edit', '/users/5'),
      '/users/5': layerAt('/users/5', 'Users/Show', '/users'),
      '/users': pageWith(),
    })

    await openCold()
    await walked('Users/Index')

    expect(requested).toEqual(['/login', '/users/5', '/users'])
    expect(currentPage.get().url).toBe('/users')
    expect(currentPage.get().layers!.map((layer) => layer.key)).toEqual(['Users/Show', 'Users/Edit'])
  })

  it('marks every layer it resolves standalone', async () => {
    await hold(loginPage)
    answering({
      '/login': layerAt('/users/5/edit', 'Users/Edit', '/users/5'),
      '/users/5': layerAt('/users/5', 'Users/Show', '/users'),
      '/users': pageWith(),
    })

    await openCold()
    await walked('Users/Index')

    expect(currentPage.get().layers!.map((layer) => layer.standalone)).toEqual([true, true])
  })

  it('pushes one history entry for the whole walk, however deep it goes', async () => {
    await hold(loginPage)
    answering({
      '/login': layerAt('/users/5/edit', 'Users/Edit', '/users/5'),
      '/users/5': layerAt('/users/5', 'Users/Show', '/users'),
      '/users': pageWith(),
    })
    const pushState = vi.spyOn(window.history, 'pushState')

    await openCold()
    await walked('Users/Index')
    await history.processQueue()

    expect(pushState).toHaveBeenCalledOnce()
  })

  it('does not walk for a layer that declares no base at all', async () => {
    await hold(loginPage)
    const requested = answering({ '/login': layerAt('/users/5/edit', 'Users/Edit') })

    const page = await openCold()

    expect(requested).toEqual(['/login'])
    expect(page.component).toBe('Users/Edit')
    expect(page.layers).toBeUndefined()
  })

  it('does not reload the page when a hop comes back as a location visit on a new version', async () => {
    await hold(loginPage)
    const requested: string[] = []

    http.setClient({
      request: async ({ url }) => {
        const path = new URL(url).pathname
        requested.push(path)

        return path === '/login'
          ? inertiaResponse(layerAt('/users/5/edit', 'Users/Edit', '/users'))
          : {
              status: 409,
              data: '',
              headers: { 'x-inertia-location': 'http://localhost/elsewhere', 'x-inertia-version': 'v2' },
            }
      },
    })

    await openCold()
    await vi.waitFor(() => expect(requested).toEqual(['/login', '/users']))
    await new Promise((resolve) => setTimeout(resolve))

    expect(window.location.href).toBe(address)
  })

  it('does not re-announce flash the base is already holding when a hop lands', async () => {
    await hold(loginPage)
    answering({ '/login': layerAt('/users/5/edit', 'Users/Edit', '/users') })

    await openCold()
    await waitingForTheHop()

    new Router().flash('message', 'Saved.')
    const dispatched = vi.spyOn(document, 'dispatchEvent')

    await answer('/users', layerAt('/users', 'Users/Index', '/users/list'))
    await vi.waitFor(() => expect(currentPage.get().layers).toHaveLength(2))

    expect(currentPage.get().flash).toEqual({ message: 'Saved.' })
    expect(dispatched.mock.calls.map(([event]) => (event as Event).type)).not.toContain('inertia:flash')
  })

  it('does not interrupt a visit the user made while the walk is running', async () => {
    await hold(loginPage)
    answering({ '/login': layerAt('/users/5/edit', 'Users/Edit', '/users/5') })

    await openCold()
    await vi.waitFor(() => expect(held.has('/users/5')).toBe(true))
    await new Promise((resolve) => setTimeout(resolve))

    let cancelled = false
    router.visit('http://localhost/dashboard', { onCancel: () => (cancelled = true) })
    await vi.waitFor(() => expect(held.has('/dashboard')).toBe(true))

    await answer('/users/5', layerAt('/users/5', 'Users/Show', '/users'))
    await vi.waitFor(() => expect(held.has('/users')).toBe(true))

    expect(cancelled).toBe(false)
  })

  it('stops when the base it is sent for is already on the stack', async () => {
    await hold(loginPage)
    const requested = answering({
      '/login': layerAt('/users/5/edit', 'Users/Edit', '/users/5'),
      '/users/5': layerAt('/users/5', 'Users/Show', '/users/5/edit'),
    })

    await openCold()
    await walked('Users/Show')

    expect(requested).toEqual(['/login', '/users/5'])
    expect(currentPage.get().url).toBe('/users/5')
    expect(currentPage.get().layers!.map((layer) => layer.key)).toEqual(['Users/Edit'])
  })

  it('stops when the base it is sent for is the same url written absolutely', async () => {
    await hold(loginPage)
    const requested = answering({
      '/login': layerAt('/users/5/edit', 'Users/Edit', '/users/5'),
      '/users/5': layerAt('/users/5', 'Users/Show', 'http://localhost/users/5/edit'),
    })

    await openCold()
    await walked('Users/Show')

    expect(requested).toEqual(['/login', '/users/5'])
    expect(currentPage.get().layers!.map((layer) => layer.key)).toEqual(['Users/Edit'])
  })

  it('announces the errors the layer it promoted brought', async () => {
    await hold(loginPage)
    answering({
      '/login': layerAt('/users/5/edit', 'Users/Edit', '/users/5'),
      '/users/5': {
        ...layerAt('/users/5', 'Users/Show', '/users/5/edit'),
        props: { errors: { team: 'The team field is required.' } },
      },
    })
    const dispatched = vi.spyOn(document, 'dispatchEvent')

    await openCold()
    await walked('Users/Show')

    expect(currentPage.get().props.errors).toEqual({ team: 'The team field is required.' })
    expect(dispatched.mock.calls.map(([event]) => (event as Event).type)).toContain('inertia:error')
  })

  it('does not re-announce the flash the base was holding when the walk stops', async () => {
    await hold(loginPage)
    answering({ '/login': layerAt('/users/5/edit', 'Users/Edit', '/users/5') })

    await openCold()
    await vi.waitFor(() => expect(held.has('/users/5')).toBe(true))
    await new Promise((resolve) => setTimeout(resolve))

    new Router().flash('message', 'Saved.')
    const dispatched = vi.spyOn(document, 'dispatchEvent')

    await answer('/users/5', layerAt('/users/5', 'Users/Show', '/users/5/edit'))
    await walked('Users/Show')

    expect(currentPage.get().flash).toEqual({})
    expect(dispatched.mock.calls.map(([event]) => (event as Event).type)).not.toContain('inertia:flash')
  })

  it('announces the flash a layer that opened over a base of its own brought', async () => {
    await hold(loginPage)
    answering({ '/login': { ...layerAt('/users/5/edit', 'Users/Edit', '/users'), flash: { message: 'Saved.' } } })
    const dispatched = vi.spyOn(document, 'dispatchEvent')

    await openCold()

    expect(dispatched.mock.calls.map(([event]) => (event as Event).type)).toContain('inertia:flash')
  })

  it('announces the flash once, and not again as the walk fills the stack beneath it', async () => {
    await hold(loginPage)
    answering({
      '/login': { ...layerAt('/users/5/edit', 'Users/Edit', '/users'), flash: { message: 'Saved.' } },
      '/users': layerAt('/users', 'Users/Index', '/users/list'),
      '/users/list': pageWith({ component: 'Users/List', url: '/users/list' }),
    })
    const dispatched = vi.spyOn(document, 'dispatchEvent')

    await openCold()
    await walked('Users/List')

    expect(dispatched.mock.calls.filter(([event]) => (event as Event).type === 'inertia:flash')).toHaveLength(1)
  })

  it('writes the layer onto the entry, not the base the walk is still fetching', async () => {
    await hold(loginPage)
    answering({ '/login': layerAt('/users/5/edit', 'Users/Edit', '/users') })
    const pushState = vi.spyOn(window.history, 'pushState')

    await openCold()
    await history.processQueue()

    const [[state]] = pushState.mock.calls as unknown as [[{ page: Page }]]

    expect(state.page.component).toBe('Users/Edit')
    expect(state.page.url).toBe('/users/5/edit')
    expect(state.page.layers).toBeUndefined()
  })

  it('writes the whole stack onto the entry once the base beneath it has arrived', async () => {
    await hold(loginPage)
    answering({ '/login': layerAt('/users/5/edit', 'Users/Edit', '/users'), '/users': pageWith() })
    const replaceState = vi.spyOn(window.history, 'replaceState')

    await openCold()
    await walked('Users/Index')
    await history.processQueue()

    const [state] = replaceState.mock.lastCall as unknown as [{ page: Page }]

    expect(state.page.component).toBe('Users/Index')
    expect(state.page.layers).toEqual([expect.objectContaining({ key: 'Users/Edit' })])
  })

  it('writes the deepest layer it has reached onto the entry as the walk goes deeper', async () => {
    await hold(loginPage)
    answering({
      '/login': layerAt('/users/5/edit', 'Users/Edit', '/users'),
      '/users': layerAt('/users', 'Users/Index', '/users/list'),
    })
    const replaceState = vi.spyOn(window.history, 'replaceState')

    await openCold()
    await vi.waitFor(() => expect(currentPage.get().layers).toHaveLength(2))
    await history.processQueue()

    const [state] = replaceState.mock.lastCall as unknown as [{ page: Page }]

    expect(state.page.component).toBe('Users/Index')
    expect(state.page.layers).toEqual([expect.objectContaining({ key: 'Users/Edit' })])
  })

  it('opens a warm layer on top of the stack a cold open walked to', async () => {
    await hold(loginPage)
    answering({
      '/login': layerAt('/users/5/edit', 'Users/Edit', '/users'),
      '/users': pageWith(),
      '/users/5/notes': layerAt('/users/5/notes', 'Notes/Edit', '/users/5'),
    })

    await openCold()
    await walked('Users/Index')

    await new Promise<void>((resolve) => {
      new Router().visit('http://localhost/users/5/notes', { onSuccess: () => resolve() })
    })

    expect(currentPage.get().component).toBe('Users/Index')
    expect(currentPage.get().layers!.map((layer) => layer.key)).toEqual(['Users/Edit', 'Notes/Edit'])
    expect(currentPage.get().layers![0].standalone).toBe(true)
    expect(currentPage.get().layers![1].standalone).toBe(false)
  })

  it('rewrites a cold layer in place when a warm visit brings its key back', async () => {
    await hold(loginPage)
    answering({
      '/login': layerAt('/users/5/edit', 'Users/Edit', '/users'),
      '/users': pageWith(),
      '/users/5/edit': pageWith({
        component: 'Users/Edit',
        url: '/users/5/edit',
        layer: { key: 'Users/Edit', base: '/users' },
        props: { user: { id: 5, name: 'Renamed' } },
      }),
    })

    await openCold()
    await walked('Users/Index')

    const [cold] = currentPage.get().layers!
    const id = cold.id

    await new Promise<void>((resolve) => {
      new Router().visit('http://localhost/users/5/edit', { onSuccess: () => resolve() })
    })

    const [rewritten] = currentPage.get().layers!
    expect(currentPage.get().layers).toHaveLength(1)
    expect(rewritten.id).toBe(id)
    expect(rewritten.standalone).toBe(true)
    expect(rewritten.props).toEqual({ user: { id: 5, name: 'Renamed' } })
  })

  it('does not land the entry on a layer the user has dismissed', async () => {
    await hold(loginPage)
    answering({ '/login': layerAt('/users/5/edit', 'Users/Edit', '/users') })

    await openCold()
    await waitingForTheHop()

    const [top] = currentPage.get().layers!
    const pushState = vi.spyOn(window.history, 'pushState')

    await marked(top.id)
    await currentPage.set({ ...currentPage.get(), props: { errors: {} } }, { preservesBase: true })
    await history.processQueue()

    const [state] = pushState.mock.lastCall as unknown as [{ page: Page }]

    expect(state.page.component).not.toBe('Users/Edit')
    expect(state.page.layers).toBeUndefined()
  })

  it('restores an entry the walk never filled in by promoting its layer to the page', async () => {
    await hold(loginPage)
    answering({ '/login': layerAt('/users/5/edit', 'Users/Edit', '/users') })
    eventHandler.init()
    const pushState = vi.spyOn(window.history, 'pushState')

    await openCold()
    await waitingForTheHop()
    await history.processQueue()

    const [[state]] = pushState.mock.calls as unknown as [[{ page: Page }]]

    listeners.get('popstate')!({ state } as PopStateEvent)
    await walked('Users/Edit')

    expect(currentPage.get().layers).toBeUndefined()
  })

  it('re-requests a restored entry that holds no page, replacing it with the page fetched for its url', async () => {
    const swaps: { component: string; preserveState: boolean }[] = []

    window.location.href = 'http://localhost/users/5/edit'

    await hold(loginPage, swapping(swaps))
    const requested = answering({ '/login': layerAt('/users/5/edit', 'Users/Edit', '/users') })
    eventHandler.init()
    const pushState = vi.spyOn(window.history, 'pushState')
    const replaceState = vi.spyOn(window.history, 'replaceState')

    await openCold()
    await waitingForTheHop()

    const [top] = currentPage.get().layers!
    await marked(top.id)
    await layerClosing.closed(top.id)
    await history.processQueue()

    const [captured] = pushState.mock.lastCall as unknown as [{ page: Page }]
    listeners.get('popstate')!({ state: captured } as PopStateEvent)

    const installed = swaps.length
    const pushes = pushState.mock.calls.length
    await vi.waitFor(() => expect(requested.filter((path) => path === '/users')).toHaveLength(2))
    await answer('/users', pageWith())

    await walked('Users/Index')
    expect(currentPage.get().component).toBe('Users/Index')
    expect(currentPage.get().props).toEqual({ users: [] })
    expect(currentPage.get().url).toBe('/users')

    expect(swaps.slice(installed)).toEqual([{ component: 'Users/Index', preserveState: true }])
    expect(pushState.mock.calls).toHaveLength(pushes)
    const [state] = replaceState.mock.lastCall as unknown as [{ page: Page }]
    expect(state.page.component).toBe('Users/Index')
    expect(state.page.layers).toBeUndefined()
  })

  it('never hands the adapter a blank page when a blank entry is restored', async () => {
    const swaps: { component: string; preserveState: boolean }[] = []

    window.location.href = 'http://localhost/users/5/edit'

    await hold(loginPage, swapping(swaps))
    const requested = answering({ '/login': layerAt('/users/5/edit', 'Users/Edit', '/users') })
    eventHandler.init()
    const pushState = vi.spyOn(window.history, 'pushState')

    await openCold()
    await waitingForTheHop()

    const [top] = currentPage.get().layers!
    await marked(top.id)
    await layerClosing.closed(top.id)
    await history.processQueue()

    const [captured] = pushState.mock.lastCall as unknown as [{ page: Page }]
    listeners.get('popstate')!({ state: captured } as PopStateEvent)

    const installed = swaps.length
    await vi.waitFor(() => expect(requested.filter((path) => path === '/users')).toHaveLength(2))

    expect(swaps.slice(installed).some(({ component }) => component === '')).toBe(false)

    await answer('/users', pageWith())
    await walked('Users/Index')
    expect(currentPage.get().component).toBe('Users/Index')
  })

  it('restores a composed entry as it was written, not as a re-request', async () => {
    const restored = composeLayer(
      pageWith(),
      pageWith({ component: 'Teams/Edit', layer: { key: 'Teams/Edit' } }),
      'layer-9',
    )

    await hold(loginPage)
    eventHandler.init()

    listeners.get('popstate')!({ state: { page: restored } } as PopStateEvent)
    await walked('Users/Index')

    expect(currentPage.get().layers!.map((layer) => layer.key)).toEqual(['Teams/Edit'])
  })

  it('recovers a blank restore on an old version through missingHistoryItem, never rendering the blank', async () => {
    const swaps: { component: string; preserveState: boolean }[] = []

    await hold(pageWith({ component: 'Users/Index', url: '/users', version: 'v2' }), swapping(swaps))
    answering({ '/users': pageWith({ component: 'Users/List', url: '/users', version: 'v1' }) })
    eventHandler.init()
    const visit = vi.spyOn(router, 'visit')
    const offMissing = eventHandler.on('missingHistoryItem', () => {
      router.visit(window.location.href, { preserveState: true, preserveScroll: true, replace: true })
    })

    try {
      listeners.get('popstate')!({
        state: { page: pageWith({ component: '', url: '/users', version: 'v1' }) },
      } as PopStateEvent)

      await vi.waitFor(() => expect(visit).toHaveBeenCalled())
      expect(visit).toHaveBeenCalledWith('http://localhost/users', {
        preserveState: true,
        preserveScroll: true,
        replace: true,
      })
      expect(swaps).not.toContainEqual(expect.objectContaining({ component: '' }))

      await walked('Users/List')
    } finally {
      offMissing()
    }
  })

  it('stops at the depth it is capped to, and warns', async () => {
    await hold(loginPage)
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const requested = answering({
      '/login': layerAt('/step-0', 'Step/0', '/step-1'),
      ...Object.fromEntries(
        Array.from({ length: maxLayerChain + 1 }, (_, step) => [
          `/step-${step + 1}`,
          layerAt(`/step-${step + 1}`, `Step/${step + 1}`, `/step-${step + 2}`),
        ]),
      ),
    })

    await openCold()
    await walked(`Step/${maxLayerChain - 1}`)

    expect(requested).toHaveLength(maxLayerChain)
    expect(warn).toHaveBeenCalledOnce()
    expect(warn).toHaveBeenCalledWith(
      `A layer chain more than ${maxLayerChain} layers deep was declared, so "/step-${maxLayerChain}" was not fetched. The deepest layer that loaded is being used as the page.`,
    )
    expect(currentPage.get().layers).toHaveLength(maxLayerChain - 1)
  })

  it('drops a hop that lands after the user has navigated away', async () => {
    await hold(loginPage)
    answering({
      '/login': layerAt('/users/5/edit', 'Users/Edit', '/users'),
      '/dashboard': pageWith({ component: 'Dashboard', url: '/dashboard' }),
    })

    await openCold()
    await waitingForTheHop()

    await new Promise<void>((resolve) => {
      new Router().visit('http://localhost/dashboard', { onSuccess: () => resolve() })
    })
    await answer('/users', pageWith())

    expect(currentPage.get().component).toBe('Dashboard')
    expect(currentPage.get().layers).toBeUndefined()
  })

  it('drops a hop that lands after the user has gone back', async () => {
    await hold(loginPage)
    answering({ '/login': layerAt('/users/5/edit', 'Users/Edit', '/users') })
    eventHandler.init()

    await openCold()
    await waitingForTheHop()

    listeners.get('popstate')!({ state: { page: loginPage } } as PopStateEvent)
    await walked('Auth/Login')
    await answer('/users', pageWith())

    expect(currentPage.get().component).toBe('Auth/Login')
    expect(currentPage.get().layers).toBeUndefined()
  })

  it('asks for the base beneath it with the version the layer arrived on', async () => {
    await hold(pageWith({ component: 'Auth/Login', url: '/login', version: 'v0' }))
    answering({ '/login': { ...layerAt('/users/5/edit', 'Users/Edit', '/users'), version: 'v1' } })

    await openCold()
    await waitingForTheHop()

    expect(sent.get('/users')!['X-Inertia-Version']).toBe('v1')
  })

  it('lands on the layer it has when a hop comes back as an error page', async () => {
    await hold(loginPage)
    const overlay = vi.spyOn(dialog, 'show').mockImplementation(() => {})
    answering({ '/login': layerAt('/users/5/edit', 'Users/Edit', '/users') })

    await openCold()
    await waitingForTheHop()
    await refuse('/users', new HttpResponseError('Request failed with status code 500', errorPage))

    await walked('Users/Edit')
    expect(currentPage.get().url).toBe('/users/5/edit')
    expect(currentPage.get().layers).toBeUndefined()
    expect(overlay).not.toHaveBeenCalled()
  })

  it('lands on the layer it has when a hop is answered by an error page the application rendered', async () => {
    await hold(loginPage)
    answering({ '/login': layerAt('/users/5/edit', 'Users/Edit', '/users') })

    await openCold()
    await waitingForTheHop()
    await refuse(
      '/users',
      new HttpResponseError('Request failed with status code 500', {
        status: 500,
        data: pageWith({ component: 'Error', url: '/users', props: { status: 500 } }) as unknown as string,
        headers: { 'x-inertia': 'true' },
      }),
    )

    await walked('Users/Edit')
    expect(currentPage.get().layers).toBeUndefined()
  })

  it('lands on the layer it has when a hop never answers', async () => {
    await hold(loginPage)
    answering({ '/login': layerAt('/users/5/edit', 'Users/Edit', '/users') })

    await openCold()
    await waitingForTheHop()
    await refuse('/users', new HttpNetworkError('Network Error', 'http://localhost/users'))

    await walked('Users/Edit')
    expect(currentPage.get().layers).toBeUndefined()
  })

  it('lands on the deepest layer it resolved when a hop further down fails', async () => {
    await hold(loginPage)
    answering({
      '/login': layerAt('/users/5/edit', 'Users/Edit', '/users/5'),
      '/users/5': layerAt('/users/5', 'Users/Show', '/users'),
    })

    await openCold()
    await waitingForTheHop()
    await refuse('/users', new HttpResponseError('Request failed with status code 500', errorPage))

    await walked('Users/Show')
    expect(currentPage.get().layers!.map((layer) => layer.key)).toEqual(['Users/Edit'])
  })

  it('still composes a visit made from inside the stack when a failed hop lands', async () => {
    await hold(loginPage)
    answering({
      '/login': layerAt('/users/5/edit', 'Users/Edit', '/users/5'),
      '/users/5': layerAt('/users/5', 'Users/Show', '/users'),
    })

    await openCold()
    await waitingForTheHop()

    new Router().visit('http://localhost/users/5/edit', { method: 'put' })
    await vi.waitFor(() => expect(held.has('/users/5/edit')).toBe(true))

    await refuse('/users', new HttpResponseError('Request failed with status code 500', errorPage))
    await walked('Users/Show')
    await answer('/users/5/edit', layerAt('/users/5/edit', 'Users/Edit', '/users/5'))

    expect(currentPage.get().component).toBe('Users/Show')
    expect(currentPage.get().layers!.map((layer) => layer.key)).toEqual(['Users/Edit'])
  })

  it('does not land a failed hop on a stack the user went back to', async () => {
    const restored = composeLayer(
      pageWith(),
      pageWith({ component: 'Teams/Edit', layer: { key: 'Teams/Edit' } }),
      'layer-9',
    )

    await hold(loginPage)
    answering({ '/login': layerAt('/users/5/edit', 'Users/Edit', '/users') })
    eventHandler.init()

    await openCold()
    await waitingForTheHop()

    listeners.get('popstate')!({ state: { page: restored } } as PopStateEvent)
    await walked('Users/Index')
    await refuse('/users', new HttpResponseError('Request failed with status code 500', errorPage))

    expect(currentPage.get().component).toBe('Users/Index')
    expect(currentPage.get().layers!.map((layer) => layer.key)).toEqual(['Teams/Edit'])
  })

  it('does not land a location-answered hop on a stack the user went back to', async () => {
    const restored = composeLayer(
      pageWith(),
      pageWith({ component: 'Teams/Edit', layer: { key: 'Teams/Edit' } }),
      'layer-9',
    )

    await hold(loginPage)
    eventHandler.init()

    http.setClient({
      request: ({ url }) => {
        const path = new URL(url).pathname

        return path === '/login'
          ? Promise.resolve(inertiaResponse(layerAt('/users/5/edit', 'Users/Edit', '/users')))
          : new Promise<HttpResponse>((resolve, reject) => held.set(path, { resolve, reject }))
      },
    })

    await openCold()
    await waitingForTheHop()

    listeners.get('popstate')!({ state: { page: restored } } as PopStateEvent)
    await walked('Users/Index')

    await refuseWith('/users', {
      status: 409,
      data: '',
      headers: { 'x-inertia-location': 'http://localhost/elsewhere', 'x-inertia-version': 'v2' },
    })

    expect(currentPage.get().component).toBe('Users/Index')
    expect(currentPage.get().layers!.map((layer) => layer.key)).toEqual(['Teams/Edit'])
  })

  it('lands on the entry the stack was already written to', async () => {
    await hold(loginPage)
    answering({ '/login': layerAt('/users/5/edit', 'Users/Edit', '/users') })
    const pushState = vi.spyOn(window.history, 'pushState')

    await openCold()
    await waitingForTheHop()
    await refuse('/users', new HttpResponseError('Request failed with status code 500', errorPage))

    await walked('Users/Edit')
    await history.processQueue()

    expect(pushState).toHaveBeenCalledOnce()
    expect(pushState).toHaveBeenCalledWith(expect.anything(), '', '/users/5/edit')
  })

  it('lands without remounting the stack above it or moving the scroll', async () => {
    const swaps: { component: string; preserveState: boolean }[] = []

    await hold(loginPage, swapping(swaps))
    answering({
      '/login': layerAt('/users/5/edit', 'Users/Edit', '/users/5'),
      '/users/5': layerAt('/users/5', 'Users/Show', '/users'),
    })

    await openCold()
    await waitingForTheHop()

    const scrollTo = vi.spyOn(window, 'scrollTo')
    await refuse('/users', new HttpResponseError('Request failed with status code 500', errorPage))
    await walked('Users/Show')

    expect(swaps.at(-1)).toEqual({ component: 'Users/Show', preserveState: true })
    expect(scrollTo).not.toHaveBeenCalled()
  })

  it('sends the walk again when a close supersedes its landing while the base component resolves', async () => {
    let landTheImport!: () => void
    const importing = new Promise<void>((resolve) => (landTheImport = resolve))
    let imports = 0

    currentPage.init({
      initialPage: loginPage,
      resolveComponent: (name) => {
        if (name !== 'Users/Index') {
          return { name } as never
        }

        // The first resolution hangs like a chunk crawling over a slow network; the retry is cached.
        return (++imports === 1 ? importing.then(() => ({ name })) : { name }) as never
      },
      swapComponent: async () => {},
    })
    await currentPage.setQuietly(loginPage)

    const requested = answering({
      '/login': layerAt('/users/5/edit', 'Users/Edit', '/users'),
      '/users': pageWith(),
    })

    await openCold()
    await vi.waitFor(() => expect(requested).toContain('/users'))
    await new Promise((resolve) => setTimeout(resolve))

    const [top] = currentPage.get().layers!
    await marked(top.id)
    await layerClosing.closed(top.id)

    landTheImport()
    await vi.waitFor(() => expect(requested.filter((path) => path === '/users')).toHaveLength(2))

    await walked('Users/Index')
    expect(currentPage.get().layers).toBeUndefined()
    expect(currentPage.get().url).toBe('/users')
  })

  it('installs the base via a re-request when the stack it was walking for has been closed', async () => {
    const swaps: { component: string; preserveState: boolean }[] = []

    await hold(loginPage, swapping(swaps))
    const requested = answering({ '/login': layerAt('/users/5/edit', 'Users/Edit', '/users') })

    await openCold()
    await waitingForTheHop()

    const [top] = currentPage.get().layers!
    await marked(top.id)
    await layerClosing.closed(top.id)

    await refuse('/users', new HttpResponseError('Request failed with status code 500', errorPage))
    await vi.waitFor(() => expect(requested.filter((path) => path === '/users')).toHaveLength(2))
    await answer('/users', pageWith())

    await walked('Users/Index')
    expect(swaps.at(-1)).toEqual({ component: 'Users/Index', preserveState: true })
    expect(currentPage.get().component).toBe('Users/Index')
  })

  it('re-requests the blank base the closed layer was standing on, replacing its entry', async () => {
    const swaps: { component: string; preserveState: boolean }[] = []

    window.location.href = 'http://localhost/users/5/edit'

    await hold(loginPage, swapping(swaps))
    const requested = answering({ '/login': layerAt('/users/5/edit', 'Users/Edit', '/users') })
    const pushState = vi.spyOn(window.history, 'pushState')
    const replaceState = vi.spyOn(window.history, 'replaceState')

    await openCold()
    await waitingForTheHop()

    const [top] = currentPage.get().layers!
    await marked(top.id)
    await layerClosing.closed(top.id)

    const installed = swaps.length
    const pushes = pushState.mock.calls.length
    await refuse('/users', new HttpResponseError('Request failed with status code 500', errorPage))
    await vi.waitFor(() => expect(requested.filter((path) => path === '/users')).toHaveLength(2))
    await answer('/users', pageWith())

    await walked('Users/Index')
    expect(currentPage.get().component).toBe('Users/Index')
    expect(currentPage.get().props).toEqual({ users: [] })
    expect(currentPage.get().url).toBe('/users')

    expect(swaps.slice(installed)).toEqual([{ component: 'Users/Index', preserveState: true }])
    expect(pushState.mock.calls).toHaveLength(pushes)
    const [state] = replaceState.mock.lastCall as unknown as [{ page: Page }]
    expect(state.page.component).toBe('Users/Index')
    expect(state.page.layers).toBeUndefined()
  })

  it('does not resurrect a layer that is mid-close when its hop fails, and re-requests the base', async () => {
    await hold(loginPage)
    const requested = answering({ '/login': layerAt('/users/5/edit', 'Users/Edit', '/users') })

    await openCold()
    await waitingForTheHop()

    const [top] = currentPage.get().layers!
    await marked(top.id)

    await refuse('/users', new HttpResponseError('Request failed with status code 500', errorPage))

    expect(currentPage.get().component).not.toBe('Users/Edit')

    await vi.waitFor(() => expect(requested.filter((path) => path === '/users')).toHaveLength(2))
    await answer('/users', pageWith())

    await walked('Users/Index')
    expect(currentPage.get().component).toBe('Users/Index')
    expect(currentPage.get().layers).toBeUndefined()
    expect(currentPage.get().url).toBe('/users')
  })

  it('shows the error dialog when the recovery re-request itself fails', async () => {
    const swaps: { component: string; preserveState: boolean }[] = []

    await hold(loginPage, swapping(swaps))
    const requested = answering({ '/login': layerAt('/users/5/edit', 'Users/Edit', '/users') })
    const overlay = vi.spyOn(dialog, 'show')

    await openCold()
    await waitingForTheHop()

    const [top] = currentPage.get().layers!
    await marked(top.id)
    await layerClosing.closed(top.id)

    const installed = swaps.length
    await refuse('/users', new HttpResponseError('Request failed with status code 500', errorPage))
    await vi.waitFor(() => expect(requested.filter((path) => path === '/users')).toHaveLength(2))
    await refuse('/users', new HttpResponseError('Request failed with status code 500', errorPage))

    await vi.waitFor(() => expect(overlay).toHaveBeenCalled())

    expect(swaps.slice(installed)).toHaveLength(0)
    expect(currentPage.get().component).toBe('')
  })

  it('does not re-request the blank when the user has navigated away from the stack being walked', async () => {
    await hold(loginPage)
    answering({
      '/login': layerAt('/users/5/edit', 'Users/Edit', '/users'),
      '/dashboard': pageWith({ component: 'Dashboard', url: '/dashboard' }),
    })
    const visit = vi.spyOn(router, 'visit')
    const dispatched = vi.spyOn(document, 'dispatchEvent')

    await openCold()
    await waitingForTheHop()

    await new Promise<void>((resolve) => {
      new Router().visit('http://localhost/dashboard', { onSuccess: () => resolve() })
    })

    await new Promise((resolve) => setTimeout(resolve))

    await refuseWith('/users', {
      status: 409,
      data: '',
      headers: { 'x-inertia-location': 'http://localhost/elsewhere', 'x-inertia-version': 'v2' },
    })

    expect(dispatched.mock.calls.filter(([event]) => (event as Event).type === 'inertia:location')).toHaveLength(1)
    expect(currentPage.get().component).toBe('Dashboard')
    expect(currentPage.get().layers).toBeUndefined()

    expect(visit).toHaveBeenCalledTimes(1)
  })

  it('does not land a failed hop into a stack the user has already left', async () => {
    await hold(loginPage)
    answering({
      '/login': layerAt('/users/5/edit', 'Users/Edit', '/users'),
      '/dashboard': pageWith({ component: 'Dashboard', url: '/dashboard' }),
    })
    const visit = vi.spyOn(router, 'visit')

    await openCold()
    await waitingForTheHop()

    await new Promise<void>((resolve) => {
      new Router().visit('http://localhost/dashboard', { onSuccess: () => resolve() })
    })

    await new Promise((resolve) => setTimeout(resolve))

    await refuse('/users', new HttpResponseError('Request failed with status code 500', errorPage))

    expect(currentPage.get().component).toBe('Dashboard')
    expect(currentPage.get().layers).toBeUndefined()

    expect(visit).toHaveBeenCalledTimes(1)
  })

  it('records the url a redirected hop answered from on the layer it inserts', async () => {
    await hold(loginPage)
    answering({
      '/login': layerAt('/users/5/edit', 'Users/Edit', '/users/5'),
      '/users/5': layerAt('/users/5?tab=profile', 'Users/Show', '/users'),
      '/users': pageWith(),
    })

    await openCold()
    await walked('Users/Index')

    expect(currentPage.get().layers!.map((layer) => layer.url)).toEqual(['/users/5?tab=profile', '/users/5/edit'])
  })

  it('walks on from the page a hop was redirected to', async () => {
    await hold(loginPage)
    const requested: string[] = []

    http.setClient({
      request: async ({ url }) => {
        const path = new URL(url).pathname
        requested.push(path)

        if (path === '/users') {
          return { status: 409, data: '', headers: { 'x-inertia-redirect': 'http://localhost/users/list' } }
        }

        return inertiaResponse(
          path === '/login' ? layerAt('/users/5/edit', 'Users/Edit', '/users') : pageWith({ url: '/users/list' }),
        )
      },
    })

    await openCold()
    await walked('Users/Index')

    expect(requested).toEqual(['/login', '/users', '/users/list'])
    expect(currentPage.get().url).toBe('/users/list')
    expect(currentPage.get().layers!.map((layer) => layer.key)).toEqual(['Users/Edit'])
  })

  it('keeps walking for the base a layer closed mid-walk was standing on', async () => {
    await hold(loginPage)
    answering({ '/login': layerAt('/users/5/edit', 'Users/Edit', '/users') })

    await openCold()
    await waitingForTheHop()

    const [top] = currentPage.get().layers!
    await marked(top.id)
    await layerClosing.closed(top.id)

    await answer('/users', layerAt('/users', 'Users/Index', '/users/list'))
    await vi.waitFor(() => expect(held.has('/users/list')).toBe(true))
    await answer('/users/list', pageWith({ component: 'Users/List', url: '/users/list' }))

    await walked('Users/List')
    expect(currentPage.get().layers!.map((layer) => layer.key)).toEqual(['Users/Index'])
  })

  it('leaves an open stack alone when a background visit is answered on a new version', async () => {
    await hold(composeLayer(pageWith(), pageWith({ component: 'Teams/Edit', layer: { key: 'Teams/Edit' } }), 'layer-9'))

    http.setClient({
      request: async () => ({
        status: 409,
        data: '',
        headers: { 'x-inertia-location': 'http://localhost/elsewhere', 'x-inertia-version': 'v2' },
      }),
    })

    await new Promise<void>((resolve) => {
      new Router().visit('http://localhost/teams', { async: true, onFinish: () => resolve() })
    })

    expect(currentPage.get().component).toBe('Users/Index')
    expect(currentPage.get().layers!.map((layer) => layer.key)).toEqual(['Teams/Edit'])
  })

  it('lands on the layer it has when a hop is answered on a new version', async () => {
    await hold(loginPage)

    http.setClient({
      request: async ({ url }) =>
        new URL(url).pathname === '/login'
          ? inertiaResponse(layerAt('/users/5/edit', 'Users/Edit', '/users'))
          : {
              status: 409,
              data: '',
              headers: { 'x-inertia-location': 'http://localhost/elsewhere', 'x-inertia-version': 'v2' },
            },
    })

    await openCold()

    await walked('Users/Edit')
    expect(currentPage.get().layers).toBeUndefined()
    expect(window.location.href).toBe(address)
  })

  describe('when the layer arrives on the initial page', () => {
    const load = async (response: Page): Promise<void> => {
      const { page } = await resolveInitialPage(response, (name) => ({ name }) as never)

      currentPage.init({
        initialPage: page,
        resolveComponent: (name) => ({ name }) as never,
        swapComponent: async () => {},
      })

      InitialVisit.handle()

      await new Promise((resolve) => setTimeout(resolve))
    }

    beforeEach(() => {
      window.location.href = 'http://localhost/users/5/edit'
      history.setCurrent({} as Page)
    })

    it('opens the layer over a base that has not arrived yet, and sends for it', async () => {
      const requested = answering({})

      await load(layerAt('/users/5/edit', 'Users/Edit', '/users'))

      expect(currentPage.get().component).toBe('')
      expect(currentPage.get().url).toBe('/users')
      expect(currentPage.get().layers).toEqual([
        expect.objectContaining({ key: 'Users/Edit', url: '/users/5/edit', base: '/users', standalone: true }),
      ])
      expect(requested).toEqual(['/users'])
    })

    it('walks on down to the page the chain stands on', async () => {
      const requested = answering({
        '/users': layerAt('/users', 'Users/Index', '/users/list'),
        '/users/list': pageWith({ component: 'Users/List', url: '/users/list' }),
      })

      await load(layerAt('/users/5/edit', 'Users/Edit', '/users'))
      await walked('Users/List')

      expect(requested).toEqual(['/users', '/users/list'])
      expect(currentPage.get().layers!.map((layer) => layer.key)).toEqual(['Users/Index', 'Users/Edit'])
    })

    it("writes the layer's address onto the entry the document arrived on", async () => {
      const replaceState = vi.spyOn(window.history, 'replaceState')
      const pushState = vi.spyOn(window.history, 'pushState')
      answering({})

      await load(layerAt('/users/5/edit', 'Users/Edit', '/users'))

      expect(pushState).not.toHaveBeenCalled()
      expect(replaceState).toHaveBeenCalledWith(expect.anything(), '', '/users/5/edit')
    })

    it('keeps the hash the browser is on with the layer that owns the address', async () => {
      window.location.href = 'http://localhost/users/5/edit#profile'
      answering({})

      await load(layerAt('/users/5/edit', 'Users/Edit', '/users'))

      expect(currentPage.get().layers![0].url).toBe('/users/5/edit#profile')
      expect(currentPage.get().url).toBe('/users')
    })

    it('renders a layer that declares no base as an ordinary page', async () => {
      const requested = answering({})

      await load(layerAt('/users/5/edit', 'Users/Edit'))

      expect(currentPage.get().component).toBe('Users/Edit')
      expect(currentPage.get().url).toBe('/users/5/edit')
      expect(currentPage.get().layers).toBeUndefined()
      expect(currentPage.get().layer).toBeUndefined()
      expect(requested).toEqual([])
    })

    it('does not send for a base a layer declares at its own url', async () => {
      const requested = answering({})

      await load(layerAt('/users/5/edit', 'Users/Edit', '/users/5/edit'))

      expect(currentPage.get().component).toBe('Users/Edit')
      expect(currentPage.get().layers).toBeUndefined()
      expect(requested).toEqual([])
    })

    it('lands on the layer it opened when the base beneath it cannot be fetched', async () => {
      answering({})

      await load(layerAt('/users/5/edit', 'Users/Edit', '/users'))
      await refuse('/users', new HttpNetworkError('Network Error', 'http://localhost/users'))

      expect(currentPage.get().component).toBe('Users/Edit')
      expect(currentPage.get().url).toBe('/users/5/edit')
      expect(currentPage.get().layers).toBeUndefined()
    })

    it('opens a layer the return leg of a location visit arrived with', async () => {
      const requested = answering({})
      SessionStorage.set(SessionStorage.locationVisitKey, { preserveScroll: false })

      await load(layerAt('/users/5/edit', 'Users/Edit', '/users'))

      await vi.waitFor(() => expect(currentPage.get().layers).toHaveLength(1))
      expect(currentPage.get().component).toBe('')
      expect(currentPage.get().layers![0].key).toBe('Users/Edit')
      expect(requested).toEqual(['/users'])
    })

    it('announces the flash the layer arrived with', async () => {
      answering({})
      const dispatched = vi.spyOn(document, 'dispatchEvent')

      await load({ ...layerAt('/users/5/edit', 'Users/Edit', '/users'), flash: { message: 'Saved.' } } as Page)

      expect(dispatched.mock.calls.map(([event]) => (event as Event).type)).toContain('inertia:flash')
    })

    it('writes the layer onto the entry while the base beneath it has not arrived', async () => {
      const replaceState = vi.spyOn(window.history, 'replaceState')
      answering({})

      await load(layerAt('/users/5/edit', 'Users/Edit', '/users'))

      const [state] = replaceState.mock.lastCall as unknown as [{ page: Page }]

      expect(state.page.component).toBe('Users/Edit')
      expect(state.page.layers).toBeUndefined()
    })

    it('creates the same layer id on every initial page, so the server and client agree', async () => {
      answering({})

      const first = await resolveInitialPage(
        layerAt('/users/5/edit', 'Users/Edit', '/users'),
        (name) => ({ name }) as never,
      )
      const second = await resolveInitialPage(
        layerAt('/users/5/edit', 'Users/Edit', '/users'),
        (name) => ({ name }) as never,
      )

      expect(first.page.layers!.map((layer) => layer.id)).toEqual(['layer-1'])
      expect(second.page.layers!.map((layer) => layer.id)).toEqual(['layer-1'])
    })

    it('installs an initial page that is not a layer exactly as it arrived', async () => {
      const requested = answering({})

      currentPage.init({
        initialPage: pageWith(),
        resolveComponent: (name) => ({ name }) as never,
        swapComponent: async () => {},
      })

      const arrived = currentPage.get()

      InitialVisit.handle()
      await new Promise((resolve) => setTimeout(resolve))

      expect(currentPage.get()).toBe(arrived)
      expect(requested).toEqual([])
    })
  })
})
