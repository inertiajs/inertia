import { Component, PLATFORM_ID, provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { router, type Page, type PageHandler } from '@inertiajs/core'
import { InertiaRuntime } from './runtime'
import { INERTIA_APP_PROPS } from './tokens'
import type { InertiaAppProps, ResolvedComponent } from './types'

@Component({ template: 'Initial' })
class InitialPage {}

@Component({ template: 'Next' })
class NextPage {}

function page(component: string, value: string): Page {
  return {
    component,
    props: { errors: {}, value },
    url: `/${value}`,
    version: null,
    flash: {},
    rescuedProps: [],
    rememberedState: {},
  }
}

describe('InertiaRuntime', () => {
  let swapComponent: PageHandler<ResolvedComponent>

  beforeEach(() => {
    swapComponent = async () => {
      throw new Error('router.init did not provide swapComponent')
    }

    vi.spyOn(router, 'init').mockImplementation((options) => {
      swapComponent = options.swapComponent as PageHandler<ResolvedComponent>
    })
    vi.spyOn(router, 'on').mockReturnValue(() => undefined)

    const initialPage = page('Initial', 'initial')
    const appProps: InertiaAppProps = {
      initialPage,
      initialComponent: InitialPage,
      resolveComponent: async () => InitialPage,
    }

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        InertiaRuntime,
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: INERTIA_APP_PROPS, useValue: appProps },
      ],
    })
  })

  it('commits a component swap before resolving it', async () => {
    const runtime = TestBed.inject(InertiaRuntime)
    const order: string[] = []
    runtime.connectRenderer(() => order.push(`render:${String(runtime.page().props['value'])}`))

    await swapComponent({
      component: NextPage,
      page: page('Next', 'next'),
      preserveState: false,
      initialRender: false,
    }).then(() => order.push('resolved'))

    expect(order).toEqual(['render:initial', 'render:next', 'resolved'])
  })

  it('keeps an early component swap pending until the renderer connects', async () => {
    const runtime = TestBed.inject(InertiaRuntime)
    const order: string[] = []
    const swap = swapComponent({
      component: NextPage,
      page: page('Next', 'next'),
      preserveState: false,
      initialRender: false,
    }).then(() => order.push('resolved'))

    await Promise.resolve()
    expect(order).toEqual([])

    runtime.connectRenderer(() => order.push(`render:${String(runtime.page().props['value'])}`))
    await swap

    expect(order).toEqual(['render:next', 'resolved'])
  })

  it('stops rendering after the renderer disconnects', () => {
    const runtime = TestBed.inject(InertiaRuntime)
    const renders: string[] = []
    const disconnect = runtime.connectRenderer(() => renders.push(String(runtime.page().props['value'])))

    disconnect()
    runtime.setLayoutProps({ title: 'Disconnected' })

    expect(renders).toEqual(['initial'])
  })

  it('retries swaps after the initial render fails instead of leaving them pending', async () => {
    const runtime = TestBed.inject(InertiaRuntime)
    let shouldFail = true
    const render = vi.fn(() => {
      if (shouldFail) {
        throw new Error('missing layout outlet')
      }
    })

    expect(() => runtime.connectRenderer(render)).toThrowError('missing layout outlet')
    await expect(
      swapComponent({
        component: NextPage,
        page: page('Next', 'still-broken'),
        preserveState: true,
        initialRender: false,
      }),
    ).rejects.toThrowError('missing layout outlet')

    shouldFail = false
    await swapComponent({
      component: NextPage,
      page: page('Next', 'recovered'),
      preserveState: true,
      initialRender: false,
    })

    expect(render).toHaveBeenCalledTimes(3)
  })

  it('does not render when resetting already empty layout props', () => {
    const runtime = TestBed.inject(InertiaRuntime)
    const render = vi.fn()
    runtime.connectRenderer(render)

    runtime.resetLayoutProps()

    expect(render).toHaveBeenCalledOnce()
  })

  it('limits consecutive render passes caused by layout prop updates', () => {
    const runtime = TestBed.inject(InertiaRuntime)
    let renderPasses = 0

    expect(() =>
      runtime.connectRenderer(() => {
        renderPasses += 1
        if (renderPasses <= 100) {
          runtime.setLayoutProps({ renderPasses })
        }
      }),
    ).toThrowError(
      '[Inertia] Exceeded 100 consecutive Angular render passes. Check for layout props updates during rendering.',
    )
    expect(renderPasses).toBe(100)
  })

  it('rejects a failed swap and recovers on the next render', async () => {
    const runtime = TestBed.inject(InertiaRuntime)
    const renders: string[] = []
    runtime.connectRenderer(() => {
      const value = String(runtime.page().props['value'])
      renders.push(value)
      if (value === 'broken') {
        runtime.setLayoutProps({ status: 'broken' })
        throw new Error('render failed')
      }
    })

    await expect(
      swapComponent({
        component: NextPage,
        page: page('Next', 'broken'),
        preserveState: true,
        initialRender: false,
      }),
    ).rejects.toThrowError('render failed')

    await swapComponent({
      component: NextPage,
      page: page('Next', 'recovered'),
      preserveState: true,
      initialRender: false,
    })

    expect(renders).toEqual(['initial', 'broken', 'recovered'])
  })
})
