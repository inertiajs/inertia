import { NgTemplateOutlet } from '@angular/common'
import {
  Component,
  Directive,
  DestroyRef,
  TemplateRef,
  computed,
  inject,
  input,
  signal,
  contentChild,
} from '@angular/core'
import { isSameUrlWithoutQueryOrHash, partialReloadRequestsSomeProps, router } from '@inertiajs/core'
import { get } from 'es-toolkit/compat'
import { usePage } from './runtime'

export interface DeferredTemplateContext {
  reloading: boolean
}

@Directive({ selector: 'ng-template[inertiaDeferredContent]' })
export class DeferredContent {
  readonly template = inject<TemplateRef<DeferredTemplateContext>>(TemplateRef)
}

@Directive({ selector: 'ng-template[inertiaDeferredFallback]' })
export class DeferredFallback {
  readonly template = inject<TemplateRef<unknown>>(TemplateRef)
}

@Directive({ selector: 'ng-template[inertiaDeferredRescue]' })
export class DeferredRescue {
  readonly template = inject<TemplateRef<DeferredTemplateContext>>(TemplateRef)
}

@Component({
  selector: 'inertia-deferred',
  imports: [NgTemplateOutlet],
  template: `
    @if (ready() && !rescued()) {
      <ng-container [ngTemplateOutlet]="content()?.template ?? null" [ngTemplateOutletContext]="context()" />
    } @else if (rescued() && rescue()) {
      <ng-container [ngTemplateOutlet]="rescue()!.template" [ngTemplateOutletContext]="context()" />
    } @else {
      <ng-container [ngTemplateOutlet]="fallback()?.template ?? null" />
    }
  `,
})
export class Deferred {
  readonly #destroyRef = inject(DestroyRef)
  readonly #page = usePage()
  readonly #activeReloads = new Set<object>()
  readonly #reloading = signal(false)

  readonly data = input.required<string | string[]>()
  readonly content = contentChild(DeferredContent)
  readonly fallback = contentChild(DeferredFallback)
  readonly rescue = contentChild(DeferredRescue)
  readonly #keys = computed<string[]>(() => {
    const data = this.data()
    return Array.isArray(data) ? data : [data]
  })
  readonly ready = computed(() => this.#keys().every((key) => get(this.#page().props, key) !== undefined))
  readonly rescued = computed(() => {
    const rescued = new Set(this.#page().rescuedProps ?? [])
    return this.#keys().some((key) => rescued.has(key))
  })
  readonly context = computed(() => ({ reloading: this.#reloading() }))

  constructor() {
    const stopStart = router.on('start', (event) => {
      const visit = event.detail.visit
      if (
        typeof window !== 'undefined' &&
        visit.preserveState === true &&
        isSameUrlWithoutQueryOrHash(visit.url, window.location) &&
        partialReloadRequestsSomeProps(visit, this.#keys())
      ) {
        this.#activeReloads.add(visit)
        this.#reloading.set(true)
      }
    })
    const stopFinish = router.on('finish', (event) => {
      const visit = event.detail.visit
      if (this.#activeReloads.delete(visit)) this.#reloading.set(this.#activeReloads.size > 0)
    })
    this.#destroyRef.onDestroy(() => {
      stopStart()
      stopFinish()
      this.#activeReloads.clear()
    })
  }
}
