import {
  Directive,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  signal,
  type Signal,
} from '@angular/core'
import {
  getScrollableParent as getScrollableParentForElement,
  useInfiniteScroll as createInfiniteScroll,
  type InfiniteScrollActionSlotProps,
  type InfiniteScrollRef,
  type InfiniteScrollSlotProps,
  type ReloadOptions,
  type UseInfiniteScrollProps,
} from '@inertiajs/core'
import { usePage } from './runtime'

type ElementTarget = HTMLElement | string | null

function resolveElement(target: ElementTarget, fallback: HTMLElement): HTMLElement {
  return typeof target === 'string' ? (document.querySelector<HTMLElement>(target) ?? fallback) : (target ?? fallback)
}

@Directive({
  selector: '[inertiaInfiniteScroll]',
  exportAs: 'inertiaInfiniteScroll',
})
export class InfiniteScroll implements InfiniteScrollRef {
  readonly #element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement
  readonly #destroyRef = inject(DestroyRef)
  readonly #page = usePage()
  readonly #instance = signal<UseInfiniteScrollProps | null>(null)
  readonly #requestCount = signal(0)
  readonly #loadingPrevious = signal(false)
  readonly #loadingNext = signal(false)
  readonly #hasPrevious = signal(false)
  readonly #hasNext = signal(false)
  #ownedStart: HTMLElement | null = null
  #ownedEnd: HTMLElement | null = null

  readonly data = input.required<string>({ alias: 'inertiaInfiniteScroll' })
  readonly buffer = input(0)
  readonly manual = input(false)
  readonly manualAfter = input(0)
  readonly preserveUrl = input(false)
  readonly reverse = input(false)
  readonly autoScroll = input<boolean | undefined>(undefined)
  readonly onlyNext = input(false)
  readonly onlyPrevious = input(false)
  readonly params = input<ReloadOptions>({})
  readonly startElement = input<ElementTarget>(null)
  readonly endElement = input<ElementTarget>(null)
  readonly itemsElement = input<ElementTarget>(null)

  readonly loadingPrevious = this.#loadingPrevious.asReadonly()
  readonly loadingNext = this.#loadingNext.asReadonly()
  readonly loading = computed(() => this.#loadingPrevious() || this.#loadingNext())
  readonly manualMode = computed(
    () => this.manual() || (this.manualAfter() > 0 && this.#requestCount() >= this.manualAfter()),
  )
  readonly hasPreviousPage = this.#hasPrevious.asReadonly()
  readonly hasNextPage = this.#hasNext.asReadonly()
  readonly slot: Signal<InfiniteScrollSlotProps> = computed(() => ({
    loading: this.loading(),
    loadingPrevious: this.#loadingPrevious(),
    loadingNext: this.#loadingNext(),
  }))
  readonly previous: Signal<InfiniteScrollActionSlotProps> = computed(() => ({
    loading: this.#loadingPrevious(),
    loadingPrevious: this.#loadingPrevious(),
    loadingNext: this.#loadingNext(),
    fetch: () => this.fetchPrevious(),
    autoMode: !this.manualMode() && !this.onlyNext(),
    manualMode: this.manualMode() || this.onlyNext(),
    hasMore: this.#hasPrevious(),
    hasPrevious: this.#hasPrevious(),
    hasNext: this.#hasNext(),
  }))
  readonly next: Signal<InfiniteScrollActionSlotProps> = computed(() => ({
    loading: this.#loadingNext(),
    loadingPrevious: this.#loadingPrevious(),
    loadingNext: this.#loadingNext(),
    fetch: () => this.fetchNext(),
    autoMode: !this.manualMode() && !this.onlyPrevious(),
    manualMode: this.manualMode() || this.onlyPrevious(),
    hasMore: this.#hasNext(),
    hasPrevious: this.#hasPrevious(),
    hasNext: this.#hasNext(),
  }))

  constructor() {
    effect(() => {
      if (this.#instance()) return
      const scrollProp = this.#page().scrollProps?.[this.data()]
      this.#hasPrevious.set(Boolean(scrollProp?.previousPage))
      this.#hasNext.set(Boolean(scrollProp?.nextPage))
    })
    afterNextRender(() => this.#setup())
    effect(() => {
      const instance = this.#instance()
      if (!instance) return
      if (this.manualMode()) instance.elementManager.disableTriggers()
      else instance.elementManager.enableTriggers()
    })
    this.#destroyRef.onDestroy(() => {
      this.#instance()?.flush()
      this.#ownedStart?.remove()
      this.#ownedEnd?.remove()
    })
  }

  fetchNext(options?: ReloadOptions): void {
    this.#instance()?.dataManager.fetchNext(options)
  }

  fetchPrevious(options?: ReloadOptions): void {
    this.#instance()?.dataManager.fetchPrevious(options)
  }

  hasPrevious(): boolean {
    return this.#instance()?.dataManager.hasPrevious() ?? false
  }

  hasNext(): boolean {
    return this.#instance()?.dataManager.hasNext() ?? false
  }

  #setup(): void {
    if (typeof document === 'undefined') return
    const getItemsElement = () => resolveElement(this.itemsElement(), this.#element)
    const getStartElement = () =>
      this.startElement()
        ? resolveElement(this.startElement(), getItemsElement())
        : (this.#ownedStart ??= this.#createTrigger('start'))
    const getEndElement = () =>
      this.endElement()
        ? resolveElement(this.endElement(), getItemsElement())
        : (this.#ownedEnd ??= this.#createTrigger('end'))
    const getScrollableParent = () => getScrollableParentForElement(getItemsElement())
    getStartElement()
    getEndElement()
    const scrollableParent = getScrollableParent()
    const syncState = () => {
      const manager = instance.dataManager
      this.#requestCount.set(manager.getRequestCount())
      this.#hasPrevious.set(manager.hasPrevious())
      this.#hasNext.set(manager.hasNext())
    }
    const instance = createInfiniteScroll({
      getPropName: () => this.data(),
      inReverseMode: () => this.reverse(),
      shouldFetchNext: () => !this.onlyPrevious(),
      shouldFetchPrevious: () => !this.onlyNext(),
      shouldPreserveUrl: () => this.preserveUrl(),
      getReloadOptions: () => this.params(),
      getTriggerMargin: () => this.buffer(),
      getStartElement,
      getEndElement,
      getItemsElement,
      getScrollableParent,
      onBeforePreviousRequest: () => this.#loadingPrevious.set(true),
      onBeforeNextRequest: () => this.#loadingNext.set(true),
      onCompletePreviousRequest: ({ completed }) => {
        this.#loadingPrevious.set(false)
        if (completed) syncState()
      },
      onCompleteNextRequest: ({ completed }) => {
        this.#loadingNext.set(false)
        if (completed) syncState()
      },
      onDataReset: syncState,
    })
    this.#instance.set(instance)
    syncState()
    instance.elementManager.setupObservers()
    instance.elementManager.processServerLoadedElements(instance.dataManager.getLastLoadedPage())
    if (!this.manualMode()) instance.elementManager.enableTriggers()

    const shouldScroll = this.autoScroll() ?? this.reverse()
    if (shouldScroll) {
      if (scrollableParent) scrollableParent.scrollTo({ top: scrollableParent.scrollHeight, behavior: 'instant' })
      else window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' })
    }
  }

  #createTrigger(position: 'start' | 'end'): HTMLElement {
    const trigger = document.createElement('div')
    trigger.dataset['inertiaInfiniteScrollTrigger'] = position
    if ((position === 'start') !== this.reverse()) this.#element.before(trigger)
    else this.#element.after(trigger)
    return trigger
  }
}
