import { isPlatformBrowser } from '@angular/common'
import { DestroyRef, Injectable, PLATFORM_ID, inject, signal, type Signal, type WritableSignal } from '@angular/core'
import {
  createHeadManager,
  createLayoutPropsStore,
  resolveServerHead,
  router,
  type HeadManager,
  type LayoutProps,
  type LayoutPropsStore,
  type NamedLayoutProps,
  type Page,
  type PageProps,
} from '@inertiajs/core'
import { isEqual } from 'es-toolkit'
import { INERTIA_APP_PROPS } from './tokens'
import type { ResolvedComponent } from './types'

const MAX_CONSECUTIVE_RENDER_PASSES = 100

@Injectable()
export class InertiaRuntime {
  readonly #appProps = inject(INERTIA_APP_PROPS)
  readonly #destroyRef = inject(DestroyRef)
  readonly #isBrowser = isPlatformBrowser(inject(PLATFORM_ID))
  readonly #page: WritableSignal<Page> = signal({
    ...this.#appProps.initialPage,
    flash: this.#appProps.initialPage.flash ?? {},
  })
  readonly #component = signal<ResolvedComponent>(this.#appProps.initialComponent)
  readonly #key = signal<number | null>(null)
  readonly #layoutPropsStore: LayoutPropsStore = createLayoutPropsStore()
  readonly #layoutProps = signal(this.#layoutPropsStore.get())
  readonly #cleanup: Array<() => void> = []
  readonly #rendererReady: Promise<void>
  #resolveRendererReady: (() => void) | undefined
  #render: (() => void) | undefined
  #isRendering = false
  #renderAgain = false

  readonly page = this.#page.asReadonly()
  readonly component = this.#component.asReadonly()
  readonly key = this.#key.asReadonly()
  readonly layoutProps = this.#layoutProps.asReadonly()
  readonly headManager: HeadManager

  constructor() {
    this.#rendererReady = new Promise((resolve) => {
      this.#resolveRendererReady = resolve
    })

    this.headManager = createHeadManager(
      !this.#isBrowser,
      (title) => this.#appProps.titleCallback?.(title, this.#page()) ?? title,
      this.#appProps.onHeadUpdate ?? (() => undefined),
      resolveServerHead(this.#page(), this.#appProps.serverHead),
    )

    if (this.#isBrowser) {
      router.init<ResolvedComponent>({
        initialPage: this.#page(),
        resolveComponent: this.#appProps.resolveComponent,
        swapComponent: async ({ component, page, preserveState, initialRender }) => {
          if (initialRender) {
            return
          }

          if (!preserveState) {
            this.#updateLayoutProps(() => this.#layoutPropsStore.reset())
            this.#key.set(Date.now())
          }

          this.#component.set(component)
          this.#page.set({ ...page, flash: page.flash ?? {} })
          await this.#commitRender()
        },
        onFlash: (flash) => {
          this.#page.update((page) => ({ ...page, flash }))
          this.#renderCurrent()
        },
      })

      const syncServerHead = (event: { detail: { page: Page } }) => {
        this.headManager.updateServerHead(resolveServerHead(event.detail.page, this.#appProps.serverHead))
      }

      this.#cleanup.push(router.on('navigate', syncServerHead), router.on('clientVisit', syncServerHead))
    }

    this.#destroyRef.onDestroy(() => {
      this.#render = undefined
      this.#cleanup.splice(0).forEach((cleanup) => cleanup())
    })
  }

  /** @internal Not part of the public API. May change or be removed without notice. */
  connectRenderer(render: () => void): () => void {
    this.#render = render
    try {
      this.#renderCurrent()
    } finally {
      this.#resolveRendererReady?.()
      this.#resolveRendererReady = undefined
    }

    return () => {
      if (this.#render === render) {
        this.#render = undefined
      }
    }
  }

  setLayoutProps(props: Partial<LayoutProps>): void {
    if (this.#updateLayoutProps(() => this.#layoutPropsStore.set(props))) {
      this.#renderCurrent()
    }
  }

  setNamedLayoutProps<K extends keyof NamedLayoutProps>(name: K, props: Partial<NamedLayoutProps[K]>): void {
    if (this.#updateLayoutProps(() => this.#layoutPropsStore.setFor(name, props))) {
      this.#renderCurrent()
    }
  }

  resetLayoutProps(): void {
    if (this.#updateLayoutProps(() => this.#layoutPropsStore.reset())) {
      this.#renderCurrent()
    }
  }

  #updateLayoutProps(update: () => void): boolean {
    const previous = this.#layoutPropsStore.get()
    update()
    const current = this.#layoutPropsStore.get()

    if (isEqual(current, previous)) {
      return false
    }

    this.#layoutProps.set(current)
    return true
  }

  #commitRender(): Promise<void> {
    if (!this.#render) {
      // History restoration can request a swap before App's outlet reaches ngAfterViewInit.
      // Keep core waiting until connectRenderer() has committed the latest state.
      return this.#rendererReady
    }

    // Rendering is part of core's swap contract: a failed render must reject the swap
    // instead of completing the visit with stale DOM.
    this.#renderCurrent()
    return Promise.resolve()
  }

  #renderCurrent(): void {
    if (!this.#render) {
      return
    }

    if (this.#isRendering) {
      // A component can update layout props while the renderer is creating it. Complete the
      // current pass first instead of re-entering ViewContainerRef rendering.
      this.#renderAgain = true
      return
    }

    let renderPasses = 0
    this.#isRendering = true

    try {
      do {
        if (renderPasses >= MAX_CONSECUTIVE_RENDER_PASSES) {
          throw new Error(
            `[Inertia] Exceeded ${MAX_CONSECUTIVE_RENDER_PASSES} consecutive Angular render passes. Check for layout props updates during rendering.`,
          )
        }

        renderPasses += 1
        this.#renderAgain = false
        this.#render()
      } while (this.#renderAgain)
    } finally {
      this.#isRendering = false
      this.#renderAgain = false
    }
  }
}

export function usePage<TProps extends PageProps = PageProps>(): Signal<Page<TProps & PageProps>> {
  return inject(InertiaRuntime).page as Signal<Page<TProps & PageProps>>
}

export function useLayoutProps(): {
  set: (props: Partial<LayoutProps>) => void
  setFor: <K extends keyof NamedLayoutProps>(name: K, props: Partial<NamedLayoutProps[K]>) => void
  reset: () => void
} {
  const runtime = inject(InertiaRuntime)

  return {
    set: (props) => runtime.setLayoutProps(props),
    setFor: (name, props) => runtime.setNamedLayoutProps(name, props),
    reset: () => runtime.resetLayoutProps(),
  }
}
