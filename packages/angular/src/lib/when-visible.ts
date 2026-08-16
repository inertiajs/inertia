import { NgTemplateOutlet } from '@angular/common'
import {
  Component,
  Directive,
  DestroyRef,
  ElementRef,
  TemplateRef,
  afterNextRender,
  computed,
  contentChild,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core'
import { router, type ReloadOptions } from '@inertiajs/core'
import { get } from 'es-toolkit/compat'
import { usePage } from './runtime'

export interface WhenVisibleTemplateContext {
  fetching: boolean
}

@Directive({ selector: 'ng-template[inertiaWhenVisibleContent]' })
export class WhenVisibleContent {
  readonly template = inject<TemplateRef<WhenVisibleTemplateContext>>(TemplateRef)
}

@Directive({ selector: 'ng-template[inertiaWhenVisibleFallback]' })
export class WhenVisibleFallback {
  readonly template = inject<TemplateRef<unknown>>(TemplateRef)
}

@Component({
  selector: 'inertia-when-visible',
  imports: [NgTemplateOutlet],
  template: `
    @if (always() || !loaded()) {
      <div #sentinel></div>
    }
    @if (loaded()) {
      <ng-container [ngTemplateOutlet]="content()?.template ?? null" [ngTemplateOutletContext]="context()" />
    } @else {
      <ng-container [ngTemplateOutlet]="fallback()?.template ?? null" />
    }
  `,
})
export class WhenVisible {
  readonly #destroyRef = inject(DestroyRef)
  readonly #page = usePage()
  // Observed on its own empty element, never on a wrapper around the loaded content, so the
  // geometry that triggers a reload stays the same before and after loading. This matches the
  // sentinel node the React and Vue adapters render.
  private readonly sentinel = viewChild<ElementRef<HTMLElement>>('sentinel')
  #observer: IntersectionObserver | null = null
  readonly #fetching = signal(false)
  readonly #loadedByRequest = signal(false)

  readonly data = input<string | string[] | undefined>(undefined)
  readonly params = input<ReloadOptions>({})
  readonly buffer = input(0)
  readonly always = input(false)
  readonly content = contentChild(WhenVisibleContent)
  readonly fallback = contentChild(WhenVisibleFallback)
  readonly #keys = computed(() => {
    const data = this.data()
    return data ? (Array.isArray(data) ? data : [data]) : []
  })
  readonly loaded = computed(() => {
    const keys = this.#keys()
    return keys.length > 0
      ? keys.every((key) => get(this.#page().props, key) !== undefined) || this.#loadedByRequest()
      : this.#loadedByRequest()
  })
  readonly context = computed(() => ({ fetching: this.#fetching() }))

  constructor() {
    afterNextRender(() => this.#registerObserver())
    effect(() => {
      const keys = this.#keys()
      const props = this.#page().props
      if (keys.some((key) => get(props, key) === undefined)) {
        this.#loadedByRequest.set(false)
      }
    })
    effect(() => {
      this.always()
      this.buffer()
      this.loaded()
      queueMicrotask(() => this.#registerObserver())
    })
    this.#destroyRef.onDestroy(() => this.#observer?.disconnect())
  }

  #registerObserver(): void {
    const sentinel = this.sentinel()?.nativeElement
    if (!sentinel || (this.loaded() && !this.always()) || typeof IntersectionObserver === 'undefined') return
    this.#observer?.disconnect()
    this.#observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || this.#fetching() || (this.loaded() && !this.always())) return
        this.#fetching.set(true)
        const params: ReloadOptions = { preserveErrors: true, ...this.params() }
        const keys = this.#keys()
        if (keys.length > 0) params.only = keys
        router.reload({
          ...params,
          onStart: (visit) => {
            this.#fetching.set(true)
            params.onStart?.(visit)
          },
          onFinish: (visit) => {
            this.#fetching.set(false)
            params.onFinish?.(visit)
            queueMicrotask(() => {
              this.#loadedByRequest.set(true)
              if (!this.always()) this.#observer?.disconnect()
            })
          },
        })
      },
      { rootMargin: `${this.buffer()}px` },
    )
    this.#observer.observe(sentinel)
  }
}
