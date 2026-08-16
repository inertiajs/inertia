import { Component, signal, provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import type { Page } from '@inertiajs/core'
import { Deferred, DeferredContent, DeferredFallback, DeferredRescue } from './deferred'
import { InertiaRuntime } from './runtime'

@Component({
  imports: [Deferred, DeferredContent, DeferredFallback, DeferredRescue],
  template: `
    <inertia-deferred data="user">
      <ng-template inertiaDeferredFallback>Loading</ng-template>
      <ng-template inertiaDeferredContent>Ready</ng-template>
      <ng-template inertiaDeferredRescue>Rescued</ng-template>
    </inertia-deferred>
  `,
})
class DeferredHost {}

function createPage(props: Record<string, unknown>, rescuedProps: string[] = []): Page {
  return {
    component: 'Deferred',
    props: { errors: {}, ...props },
    url: '/deferred',
    version: null,
    rescuedProps,
  } as Page
}

describe('Deferred', () => {
  it('switches from fallback to content and gives rescued props precedence', async () => {
    const page = signal(createPage({}))
    TestBed.configureTestingModule({
      imports: [DeferredHost],
      providers: [provideZonelessChangeDetection(), { provide: InertiaRuntime, useValue: { page: page.asReadonly() } }],
    })
    const fixture = TestBed.createComponent(DeferredHost)
    await fixture.whenStable()
    expect(fixture.nativeElement.textContent).toContain('Loading')

    page.set(createPage({ user: { name: 'Ada' } }))
    await fixture.whenStable()
    expect(fixture.nativeElement.textContent).toContain('Ready')

    page.set(createPage({ user: { name: 'Ada' } }, ['user']))
    await fixture.whenStable()
    expect(fixture.nativeElement.textContent).toContain('Rescued')
  })
})
