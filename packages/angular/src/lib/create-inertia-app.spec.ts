import { Component } from '@angular/core'
import type { Page } from '@inertiajs/core'

const exposeInterceptors = vi.fn()
let createInertiaApp: typeof import('./create-inertia-app').default

@Component({ template: 'Page' })
class TestPage {}

const page = {
  component: 'TestPage',
  props: { errors: {} },
  url: '/',
  version: null,
  flash: {},
  rescuedProps: [],
  rememberedState: {},
} satisfies Page

describe('createInertiaApp', () => {
  beforeAll(async () => {
    vi.doMock('@inertiajs/core', async (importOriginal) => ({
      ...((await importOriginal()) as object),
      exposeInterceptors,
    }))
    createInertiaApp = (await import('./create-inertia-app')).default
  })

  beforeEach(() => {
    exposeInterceptors.mockClear()
    document.body.innerHTML = '<div id="app"></div>'
  })

  it('exposes development interceptors when dev mode is enabled', async () => {
    await createInertiaApp({
      page,
      resolve: () => TestPage,
      setup: () => undefined,
      progress: false,
      dev: true,
    })

    expect(exposeInterceptors).toHaveBeenCalledOnce()
  })

  it('does not expose development interceptors when dev mode is disabled', async () => {
    await createInertiaApp({
      page,
      resolve: () => TestPage,
      setup: () => undefined,
      progress: false,
      dev: false,
    })

    expect(exposeInterceptors).not.toHaveBeenCalled()
  })
})
