import { Component, ViewContainerRef, input, provideZonelessChangeDetection, viewChild } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import type { Page } from '@inertiajs/core'
import { h, InertiaRenderer, LayoutOutlet } from './renderer'
import type { ResolvedComponent } from './types'

@Component({
  selector: 'test-page',
  template: '<span>{{ name() }}</span>',
})
class TestPage {
  static instances = 0
  readonly instance = ++TestPage.instances
  readonly name = input('Default name')
}

@Component({
  selector: 'test-layout',
  imports: [LayoutOutlet],
  template: '<main><inertia-layout-outlet /></main>',
})
class TestLayout {
  static instances = 0
  readonly instance = ++TestLayout.instances
}

@Component({
  selector: 'test-broken-layout',
  template: '<main>Never renders an outlet</main>',
})
class BrokenLayout {}

@Component({
  selector: 'test-tracked-page',
  template: '<span>Tracked</span>',
})
class TrackedPage {
  static destroyed = 0
  ngOnDestroy(): void {
    TrackedPage.destroyed++
  }
}

@Component({
  template: '<ng-container #outlet />',
})
class TestHost {
  readonly outlet = viewChild.required('outlet', { read: ViewContainerRef })
}

function page(props: Record<string, unknown>): Page {
  return { component: 'Test', props: { errors: {}, ...props }, url: '/test', version: null } as Page
}

describe('InertiaRenderer', () => {
  beforeEach(() => {
    TestLayout.instances = 0
    TestPage.instances = 0
    TrackedPage.destroyed = 0
    delete (TestPage as ResolvedComponent).layout
    TestBed.configureTestingModule({
      imports: [TestHost],
      providers: [provideZonelessChangeDetection(), InertiaRenderer],
    })
  })

  it('updates declared inputs and clears a removed input on a preserved page', async () => {
    const fixture = TestBed.createComponent(TestHost)
    fixture.detectChanges()
    const renderer = TestBed.inject(InertiaRenderer)
    const component = TestPage as ResolvedComponent

    renderer.render(fixture.componentInstance.outlet(), component, page({ name: 'Ada', unknown: 'ignored' }), null, {
      shared: {},
      named: {},
    })
    expect(fixture.nativeElement.textContent).toContain('Ada')

    renderer.render(fixture.componentInstance.outlet(), component, page({}), null, { shared: {}, named: {} })
    expect(fixture.nativeElement.textContent).not.toContain('Ada')
  })

  it('keeps a compatible layout instance while replacing the page', () => {
    const fixture = TestBed.createComponent(TestHost)
    fixture.detectChanges()
    const renderer = TestBed.inject(InertiaRenderer)
    const component = TestPage as ResolvedComponent
    component.layout = TestLayout

    renderer.render(fixture.componentInstance.outlet(), component, page({ name: 'One' }), null, {
      shared: {},
      named: {},
    })
    renderer.render(fixture.componentInstance.outlet(), component, page({ name: 'Two' }), Date.now(), {
      shared: {},
      named: {},
    })

    expect(TestLayout.instances).toBe(1)
    expect(fixture.nativeElement.textContent).toContain('Two')
  })

  it('preserves a page while its render key is unchanged', () => {
    const fixture = TestBed.createComponent(TestHost)
    fixture.detectChanges()
    const renderer = TestBed.inject(InertiaRenderer)
    const component = TestPage as ResolvedComponent

    renderer.render(fixture.componentInstance.outlet(), component, page({ name: 'One' }), 42, {
      shared: {},
      named: {},
    })
    renderer.render(fixture.componentInstance.outlet(), component, page({ name: 'Two' }), 42, {
      shared: {},
      named: {},
    })
    renderer.render(fixture.componentInstance.outlet(), component, page({ name: 'Three' }), 43, {
      shared: {},
      named: {},
    })

    expect(TestPage.instances).toBe(2)
    expect(fixture.nativeElement.textContent).toContain('Three')
  })

  it('accepts a regular two-argument layout render function', () => {
    const fixture = TestBed.createComponent(TestHost)
    fixture.detectChanges()
    const renderer = TestBed.inject(InertiaRenderer)
    const component = TestPage as ResolvedComponent
    component.layout = function render(create, child) {
      return create(TestLayout, child)
    }

    renderer.render(fixture.componentInstance.outlet(), component, page({ name: 'Rendered' }), null, {
      shared: {},
      named: {},
    })

    expect(TestLayout.instances).toBe(1)
    expect(fixture.nativeElement.textContent).toContain('Rendered')
  })

  it('reports the same error every time a layout without an outlet is rendered', () => {
    const fixture = TestBed.createComponent(TestHost)
    fixture.detectChanges()
    const renderer = TestBed.inject(InertiaRenderer)
    const component = TestPage as ResolvedComponent
    const outlet = fixture.componentInstance.outlet()
    const render = () => renderer.render(outlet, component, page({}), null, { shared: {}, named: {} })

    // A successful render first, so there is a live page outlet to go stale.
    component.layout = TestLayout
    render()

    // The failed render replaces the recorded layout chain and detaches the old one. Without
    // rolling that back, the next render sees a matching chain, takes the reuse fast path and
    // builds into the outlet that no longer exists instead of reporting the real problem.
    component.layout = BrokenLayout
    expect(render).toThrow(/must render <inertia-layout-outlet \/>/)
    expect(render).toThrow(/must render <inertia-layout-outlet \/>/)
  })

  it('destroys views still pending detachment when the renderer is destroyed', () => {
    const fixture = TestBed.createComponent(TestHost)
    fixture.detectChanges()
    const renderer = TestBed.inject(InertiaRenderer)
    const outlet = fixture.componentInstance.outlet()

    renderer.render(outlet, TrackedPage as ResolvedComponent, page({}), null, { shared: {}, named: {} })
    renderer.render(outlet, TestPage as ResolvedComponent, page({}), null, { shared: {}, named: {} })

    // `detach()` does not destroy, so the queued cleanup still owns the view.
    expect(TrackedPage.destroyed).toBe(0)

    TestBed.resetTestingModule()

    expect(TrackedPage.destroyed).toBe(1)
  })

  it('creates render-function descriptors without touching the DOM', () => {
    expect(h(TestLayout, h(TestPage))).toEqual({
      component: TestLayout,
      children: [{ component: TestPage, children: [] }],
    })
  })
})
