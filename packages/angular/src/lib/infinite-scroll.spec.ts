import { Component, provideZonelessChangeDetection, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import * as core from '@inertiajs/core'
import type { Page, UseInfiniteScrollProps } from '@inertiajs/core'
import { InfiniteScroll } from './infinite-scroll'
import { InertiaRuntime } from './runtime'

@Component({
  imports: [InfiniteScroll],
  template: `
    <div id="scroll-parent-one" style="overflow-y: scroll">
      <div id="items-one"></div>
    </div>
    <div id="scroll-parent-two" style="overflow-y: scroll">
      <div id="items-two"></div>
    </div>
    <div id="start-one"></div>
    <div id="start-two"></div>
    <div id="end-one"></div>
    <div id="end-two"></div>
    <div
      id="items"
      inertiaInfiniteScroll="users"
      [reverse]="reverse()"
      [autoScroll]="false"
      [startElement]="startElement()"
      [endElement]="endElement()"
      [itemsElement]="itemsElement()"
    ></div>
  `,
})
class InfiniteScrollHost {
  readonly reverse = signal(false)
  readonly startElement = signal<string | null>(null)
  readonly endElement = signal<string | null>(null)
  readonly itemsElement = signal<string | null>(null)
}

describe('InfiniteScroll', () => {
  const dataManager: UseInfiniteScrollProps['dataManager'] = {
    getLastLoadedPage: () => 1,
    getPageName: () => 'page',
    getRequestCount: () => 0,
    hasPrevious: () => true,
    hasNext: () => true,
    fetchNext: vi.fn(),
    fetchPrevious: vi.fn(),
    removeEventListener: vi.fn(),
  }
  const elementManager: UseInfiniteScrollProps['elementManager'] = {
    setupObservers: vi.fn(),
    enableTriggers: vi.fn(),
    disableTriggers: vi.fn(),
    refreshTriggers: vi.fn(),
    flushAll: vi.fn(),
    processManuallyAddedElements: vi.fn(),
    processServerLoadedElements: vi.fn(),
  }
  const instance: UseInfiniteScrollProps = { dataManager, elementManager, flush: vi.fn() }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(core, 'useInfiniteScroll').mockReturnValue(instance)
    TestBed.configureTestingModule({
      imports: [InfiniteScrollHost],
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: InertiaRuntime,
          useValue: {
            page: signal({
              component: 'Users',
              props: { errors: {} },
              url: '/users',
              version: null,
              flash: {},
              rescuedProps: [],
              rememberedState: {},
              scrollProps: {
                users: { pageName: 'page', previousPage: 1, currentPage: 2, nextPage: 3, reset: false },
              },
            } satisfies Page),
          },
        },
      ],
    })
  })

  it('places owned triggers around the native items element and cleans them up', async () => {
    const fixture = TestBed.createComponent(InfiniteScrollHost)
    await fixture.whenStable()

    const items = fixture.nativeElement.querySelector('#items') as HTMLElement
    expect(items.previousElementSibling?.getAttribute('data-inertia-infinite-scroll-trigger')).toBe('start')
    expect(items.nextElementSibling?.getAttribute('data-inertia-infinite-scroll-trigger')).toBe('end')
    expect(elementManager.setupObservers).toHaveBeenCalledOnce()

    fixture.destroy()
    expect(instance.flush).toHaveBeenCalledOnce()
    expect(fixture.nativeElement.querySelector('[data-inertia-infinite-scroll-trigger]')).toBeNull()
  })

  it('reverses trigger placement in reverse mode', async () => {
    const fixture = TestBed.createComponent(InfiniteScrollHost)
    fixture.componentInstance.reverse.set(true)
    await fixture.whenStable()

    const items = fixture.nativeElement.querySelector('#items') as HTMLElement
    expect(items.previousElementSibling?.getAttribute('data-inertia-infinite-scroll-trigger')).toBe('end')
    expect(items.nextElementSibling?.getAttribute('data-inertia-infinite-scroll-trigger')).toBe('start')
  })

  it('resolves custom elements from the latest input values', async () => {
    const fixture = TestBed.createComponent(InfiniteScrollHost)
    await fixture.whenStable()
    const [options] = vi.mocked(core.useInfiniteScroll).mock.calls.at(-1) ?? []

    fixture.componentInstance.startElement.set('#start-one')
    fixture.componentInstance.endElement.set('#end-one')
    fixture.componentInstance.itemsElement.set('#items-one')
    await fixture.whenStable()

    expect(options?.getStartElement()).toBe(fixture.nativeElement.querySelector('#start-one'))
    expect(options?.getEndElement()).toBe(fixture.nativeElement.querySelector('#end-one'))
    expect(options?.getItemsElement()).toBe(fixture.nativeElement.querySelector('#items-one'))
    expect(options?.getScrollableParent()).toBe(fixture.nativeElement.querySelector('#scroll-parent-one'))

    fixture.componentInstance.startElement.set('#start-two')
    fixture.componentInstance.endElement.set('#end-two')
    fixture.componentInstance.itemsElement.set('#items-two')
    await fixture.whenStable()

    expect(options?.getStartElement()).toBe(fixture.nativeElement.querySelector('#start-two'))
    expect(options?.getEndElement()).toBe(fixture.nativeElement.querySelector('#end-two'))
    expect(options?.getItemsElement()).toBe(fixture.nativeElement.querySelector('#items-two'))
    expect(options?.getScrollableParent()).toBe(fixture.nativeElement.querySelector('#scroll-parent-two'))
  })
})
