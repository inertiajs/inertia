import { describe, expect, it } from 'vitest'
import { composeLayer, composeLocalLayer, loadingBase } from '../src/layers'
import { LandingInput, LandingVisit, planLanding } from '../src/layers/landing'
import { Page } from '../src/types'
import { pageWith } from './support/layers'

const visitWith = (overrides: Partial<LandingVisit> = {}): LandingVisit => ({
  url: new URL('http://localhost/users'),
  claims: false,
  walk: false,
  partial: false,
  reload: false,
  replace: false,
  preserveScroll: false,
  preserveState: false,
  preserveUrl: false,
  ...overrides,
})

const editLayer = (overrides: Partial<Page> = {}): Page =>
  pageWith({ component: 'Users/Edit', url: '/users/5/edit', layer: { key: 'Users/Edit' }, ...overrides })

const inputFor = (overrides: Partial<LandingInput> = {}): LandingInput => {
  const response = overrides.response ?? editLayer()
  const live = overrides.live ?? { page: pageWith(), generation: 7 }

  return {
    response,
    responseUrl: response.url,
    live,
    baseId: 'base-1',
    captured: live,
    visit: visitWith(),
    ...overrides,
  }
}

// The plan of a response is read off the page on screen; the landing off what is left once the
// stack closed down. With nothing to close, the two are the same page.
const landingFor = (overrides: Partial<LandingInput> = {}) => {
  const input = inputFor(overrides)

  return planLanding(input).land(input.live.page)
}

const stackWith = (key: string, id = 'layer-1', base: Page = pageWith()): Page =>
  composeLayer(base, pageWith({ component: key, url: `/${key.toLowerCase()}`, layer: { key } }), id)

describe('whether a layer response composes over the captured base', () => {
  const loginPage = pageWith({ component: 'Auth/Login', url: '/login' })

  const composes = (overrides: Partial<LandingInput> = {}): boolean =>
    planLanding(
      inputFor({
        live: { page: loginPage, generation: 7 },
        captured: { page: loginPage, generation: 7 },
        visit: visitWith({ url: new URL('http://localhost/login') }),
        ...overrides,
      }),
    ).composesAsLayer

  it('holds when the visit was dispatched toward the layer', () => {
    expect(composes({ visit: visitWith({ url: new URL('http://localhost/users/5/edit') }) })).toBe(true)
  })

  it('holds when the layer is already open', () => {
    expect(composes({ live: { page: stackWith('Users/Edit'), generation: 7 } })).toBe(true)
  })

  it('holds when the layer it was dispatched from is still open', () => {
    const stack = stackWith('Teams/Show')

    expect(composes({ captured: { page: stack, generation: 7 }, live: { page: stack, generation: 7 } })).toBe(true)
  })

  it('holds when the layer declares the page on screen as its base', () => {
    expect(
      composes({
        response: editLayer({ layer: { key: 'Users/Edit', base: '/login' } }),
      }),
    ).toBe(true)
  })

  it('holds for an open, whatever the visit was dispatched toward', () => {
    expect(composes({ visit: visitWith({ url: new URL('http://localhost/login'), layerOwner: 'base-1' }) })).toBe(true)
  })

  it('fails once the layer it was dispatched from has been closed', () => {
    expect(composes({ captured: { page: stackWith('Teams/Show'), generation: 7 } })).toBe(false)
  })

  it('fails when the layer it was dispatched from has been closed and another opened', () => {
    expect(
      composes({
        captured: { page: stackWith('Teams/Show'), generation: 7 },
        live: { page: stackWith('Teams/Members', 'layer-2'), generation: 7 },
      }),
    ).toBe(false)
  })

  it('fails for a layer returned through a login page', () => {
    expect(composes()).toBe(false)
  })

  it('fails once the base it captured has been replaced, whatever else holds', () => {
    expect(
      composes({
        visit: visitWith({ url: new URL('http://localhost/users/5/edit') }),
        live: { page: loginPage, generation: 8 },
      }),
    ).toBe(false)
  })

  it('never composes a hop of a walk, which is fetching the base beneath', () => {
    expect(composes({ visit: visitWith({ url: new URL('http://localhost/users/5/edit'), walk: true }) })).toBe(false)
  })
})

describe('a layer response landing', () => {
  it('opens a new layer over the base, leaving the base standing', () => {
    const landing = landingFor({ visit: visitWith({ url: new URL('http://localhost/users/5/edit') }) })

    expect(landing.page.component).toBe('Users/Index')
    expect(landing.page.layers!.map((layer) => layer.component)).toEqual(['Users/Edit'])
    expect(landing.landedOn).toBe(landing.page.layers![0].id)
    expect(landing.set).toEqual({ replace: false, preserveScroll: true, preserveState: true, preservesBase: true })
    expect(loadingBase(landing.page)).toBeUndefined()
  })

  it('rewrites the layer already open under the same key rather than stacking a second', () => {
    const live = { page: stackWith('Users/Edit'), generation: 7 }
    const landing = landingFor({
      response: editLayer({ props: { user: { id: 6 } } }),
      live,
      visit: visitWith({ url: new URL('http://localhost/users/6/edit'), layerId: 'layer-1' }),
    })

    expect(landing.page.layers).toHaveLength(1)
    expect(landing.landedOn).toBe('layer-1')
    expect(landing.page.layers![0].props).toEqual({ user: { id: 6 } })
  })

  it('opens under the id the call created, so its handle answers for it', () => {
    const landing = landingFor({
      visit: visitWith({ url: new URL('http://localhost/users/5/edit'), layerId: 'layer-9', layerOwner: 'base-1' }),
    })

    expect(landing.landedOn).toBe('layer-9')
    expect(landing.page.layers![0].owner).toBe('base-1')
  })

  it('closes the stack down to the layer a deeper link named before landing', () => {
    const live = { page: stackWith('Teams/Show', 'layer-2', stackWith('Users/Edit')), generation: 7 }
    const plan = planLanding(
      inputFor({ live, visit: visitWith({ url: new URL('http://localhost/users/5/edit'), layerId: 'layer-1' }) }),
    )

    expect(plan.composesAsLayer).toBe(true)
    expect(plan.dismisses).toBe('layer-2')
  })

  it('leaves the stack alone when a refresh in place answers a layer beneath the top', () => {
    const live = { page: stackWith('Teams/Show', 'layer-2', stackWith('Users/Edit')), generation: 7 }
    const plan = planLanding(
      inputFor({
        live,
        visit: visitWith({ url: new URL('http://localhost/users/5/edit'), layerId: 'layer-1', partial: true }),
      }),
    )

    expect(plan.dismisses).toBeUndefined()
  })

  it('stands a layer with nowhere valid to sit on a cold base and walks to fetch it', () => {
    const landing = landingFor({
      response: editLayer({ layer: { key: 'Users/Edit', base: '/users' } }),
      live: { page: pageWith({ component: 'Auth/Login', url: '/login' }), generation: 7 },
      captured: { page: pageWith({ component: 'Auth/Login', url: '/login' }), generation: 6 },
    })

    expect(landing.page.component).toBe('')
    expect(landing.page.url).toBe('/users')
    expect(loadingBase(landing.page)).toBe('/users')
    expect(landing.page.layers![0].standalone).toBe(true)
    expect(landing.preserveUrl).toBe(false)
  })

  it('promotes a layer that declares no base and cannot compose to the page', () => {
    const landing = landingFor({
      live: { page: pageWith({ component: 'Auth/Login', url: '/login' }), generation: 7 },
      captured: { page: pageWith({ component: 'Auth/Login', url: '/login' }), generation: 6 },
    })

    expect(landing.page.component).toBe('Users/Edit')
    expect(landing.page).not.toHaveProperty('layers')
    expect(landing.landedOn).toBeUndefined()
    expect(landing.set.preservesBase).toBe(false)
  })
})

describe('a walk hop landing', () => {
  const blank = composeLayer(
    { ...pageWith(), component: '', url: '/users' },
    editLayer({ layer: { key: 'Users/Edit', base: '/users' } }),
    'layer-1',
    { standalone: true },
  )

  it('fills in the blank base beneath the stack', () => {
    const landing = landingFor({
      response: pageWith(),
      live: { page: blank, generation: 7 },
      visit: visitWith({ walk: true }),
    })

    expect(landing.page.component).toBe('Users/Index')
    expect(landing.page.layers!.map((layer) => layer.id)).toEqual(['layer-1'])
    expect(loadingBase(landing.page)).toBeUndefined()
    expect(landing.set.preservesBase).toBe(true)
  })

  it('inserts a base that is itself a layer beneath the stack and keeps walking', () => {
    const landing = landingFor({
      response: pageWith({ component: 'Users/Index', url: '/users', layer: { key: 'Users/Index', base: '/' } }),
      live: { page: blank, generation: 7 },
      visit: visitWith({ walk: true }),
    })

    expect(landing.page.layers!.map((layer) => layer.component)).toEqual(['Users/Index', 'Users/Edit'])
    expect(loadingBase(landing.page)).toBe('/')
  })
})

describe('a page response landing', () => {
  it('replaces the page and takes the stack with it', () => {
    const landing = landingFor({
      response: pageWith({ component: 'Teams/Index', url: '/teams' }),
      live: { page: stackWith('Users/Edit'), generation: 7 },
    })

    expect(landing.page.component).toBe('Teams/Index')
    expect(landing.page).not.toHaveProperty('layers')
    expect(landing.set.preservesBase).toBe(false)
  })

  describe('refreshing the base', () => {
    const refreshes = (response: Page, visit: Partial<LandingVisit>): boolean =>
      landingFor({ response, visit: visitWith(visit) }).set.preservesBase

    it('a reload of the same component refreshes it', () => {
      expect(refreshes(pageWith(), { reload: true })).toBe(true)
    })

    it('a reload redirected to another component does not', () => {
      expect(refreshes(pageWith({ component: 'Auth/Login', url: '/login' }), { reload: true })).toBe(false)
    })

    it('a visit to another url of the same component does not', () => {
      expect(refreshes(pageWith({ url: '/users?page=2' }), {})).toBe(false)
    })

    it('a partial reload of the same component still refreshes it', () => {
      expect(refreshes(pageWith(), { partial: true })).toBe(true)
    })

    it('a partial reload of another url of the same component does not', () => {
      expect(refreshes(pageWith({ url: '/users?search=x' }), { partial: true })).toBe(false)
    })
  })

  it('keeps the stack over a base a reload refreshes', () => {
    const landing = landingFor({
      response: pageWith({ props: { users: [1] } }),
      live: { page: stackWith('Users/Edit'), generation: 7 },
      visit: visitWith({ reload: true }),
    })

    expect(landing.page.props).toEqual({ users: [1] })
    expect(landing.page.layers!.map((layer) => layer.id)).toEqual(['layer-1'])
  })

  it('hands errors back to a local layer submitted from the address beneath it', () => {
    const live = { page: composeLocalLayer(pageWith(), 'Prompt', { step: 1 }, 'layer-1', 'base-1'), generation: 7 }
    const landing = landingFor({
      response: pageWith({ props: { users: [], errors: { name: 'Required' } }, flash: { note: 'x' } }),
      live,
      visit: visitWith({ layerId: 'layer-1' }),
    })

    expect(landing.landedOn).toBe('layer-1')
    expect(landing.page.props.errors).toEqual({})
    expect(landing.page.flash).toEqual({})
    expect(landing.page.layers![0].props).toEqual({ step: 1, errors: { name: 'Required' } })
    expect(landing.page.layers![0].flash).toEqual({ note: 'x' })
    expect(landing.set.preservesBase).toBe(true)
  })
})

describe('a detour', () => {
  const prompt = pageWith({ component: 'Auth/Confirm', url: '/confirm', interstitial: true })
  const dispatched = new URL('http://localhost/users/5/edit')
  const before = { page: pageWith(), generation: 7 }

  // The prompt lands as a plain page and pins the base the layer was dispatched from.
  const pinnedByPrompt = () =>
    landingFor({ response: prompt, live: before, captured: before, visit: visitWith({ url: dispatched }) }).pin

  it('pins the base the layer was dispatched from through the prompt', () => {
    const pin = pinnedByPrompt()

    expect(pin?.layer.base).toBe(before.page)
    expect(pin?.dispatchedUrl).toBe('http://localhost/users/5/edit')
  })

  it('composes the returning layer over the pinned base', () => {
    // The prompt is on screen and the base has moved on, yet the layer comes back over the pin.
    const landing = landingFor({
      live: { page: prompt, generation: 8 },
      captured: { page: prompt, generation: 7 },
      visit: visitWith({ url: dispatched }),
      pinned: pinnedByPrompt(),
    })

    expect(landing.page.component).toBe('Users/Index')
    expect(landing.page.layers![0].component).toBe('Users/Edit')
    // The layer's entry takes the prompt's place.
    expect(landing.set.replace).toBe(true)
    // The return spends the pin.
    expect(landing.pin).toBeUndefined()
  })

  it('is ended by any unmarked page that lands', () => {
    const ended = landingFor({
      response: pageWith({ component: 'Teams/Index', url: '/teams' }),
      visit: visitWith(),
      pinned: pinnedByPrompt(),
    })

    expect(ended.pin).toBeUndefined()

    const landing = landingFor({
      live: { page: prompt, generation: 8 },
      captured: { page: prompt, generation: 7 },
      visit: visitWith({ url: dispatched }),
      pinned: ended.pin,
    })

    expect(landing.page.component).toBe('Users/Edit')
    expect(landing.page).not.toHaveProperty('layers')
  })

  it('is kept by the prompt answering its own submit', () => {
    const pin = pinnedByPrompt()

    const again = landingFor({
      response: prompt,
      live: { page: prompt, generation: 8 },
      captured: { page: prompt, generation: 8 },
      visit: visitWith({ url: new URL('http://localhost/confirm') }),
      pinned: pin,
    })

    expect(again.pin).toBe(pin)
  })

  it('is left alone by a layer that is not the return', () => {
    const pin = pinnedByPrompt()

    const other = landingFor({
      response: editLayer({ component: 'Teams/Edit', url: '/teams/1/edit', layer: { key: 'Teams/Edit' } }),
      live: { page: prompt, generation: 8 },
      captured: { page: prompt, generation: 8 },
      visit: visitWith({ url: new URL('http://localhost/teams/1/edit') }),
      pinned: pin,
    })

    expect(other.pin).toBe(pin)
  })
})
