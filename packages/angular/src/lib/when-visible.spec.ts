import { Component, provideZonelessChangeDetection, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import type { Page } from '@inertiajs/core'
import { InertiaRuntime } from './runtime'
import { WhenVisible, WhenVisibleContent, WhenVisibleFallback } from './when-visible'

@Component({
  imports: [WhenVisible, WhenVisibleContent, WhenVisibleFallback],
  template: `
    <inertia-when-visible data="items" [always]="true">
      <ng-template inertiaWhenVisibleFallback>Loading</ng-template>
      <ng-template inertiaWhenVisibleContent><span>Tall loaded content</span></ng-template>
    </inertia-when-visible>
  `,
})
class WhenVisibleHost {}

function createPage(props: Record<string, unknown>): Page {
  return { component: 'WhenVisible', props: { errors: {}, ...props }, url: '/when-visible', version: null } as Page
}

describe('WhenVisible', () => {
  const observed: Element[] = []
  let original: typeof IntersectionObserver

  beforeEach(() => {
    observed.length = 0
    original = globalThis.IntersectionObserver
    globalThis.IntersectionObserver = class {
      observe(element: Element): void {
        observed.push(element)
      }
      disconnect(): void {}
      unobserve(): void {}
    } as unknown as typeof IntersectionObserver
  })

  afterEach(() => {
    globalThis.IntersectionObserver = original
  })

  it('observes an empty sentinel instead of a wrapper around the loaded content', async () => {
    const page = signal(createPage({}))
    TestBed.configureTestingModule({
      imports: [WhenVisibleHost],
      providers: [provideZonelessChangeDetection(), { provide: InertiaRuntime, useValue: { page: page.asReadonly() } }],
    })
    const fixture = TestBed.createComponent(WhenVisibleHost)
    await fixture.whenStable()

    page.set(createPage({ items: ['one'] }))
    await fixture.whenStable()

    expect(fixture.nativeElement.textContent).toContain('Tall loaded content')
    expect(observed.length).toBeGreaterThan(0)

    // With `always` the observer keeps running after the content arrives. If it watched the
    // element wrapping that content, its geometry would change with the payload; the sentinel
    // keeps the trigger point stable, matching the React and Vue adapters.
    observed.forEach((element) => {
      expect(element.textContent).toBe('')
      expect(element.children.length).toBe(0)
    })
  })
})
