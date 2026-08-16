import { isPlatformBrowser } from '@angular/common'
import {
  ApplicationRef,
  Directive,
  DestroyRef,
  EmbeddedViewRef,
  PLATFORM_ID,
  TemplateRef,
  afterRenderEffect,
  inject,
  input,
  type AfterViewInit,
} from '@angular/core'
import { escape } from 'es-toolkit/compat'
import { InertiaRuntime } from './runtime'

@Directive({
  selector: 'ng-template[inertiaHead]',
  exportAs: 'inertiaHead',
})
export class Head implements AfterViewInit {
  readonly #template = inject<TemplateRef<unknown>>(TemplateRef)
  readonly #applicationRef = inject(ApplicationRef)
  readonly #destroyRef = inject(DestroyRef)
  readonly #isBrowser = isPlatformBrowser(inject(PLATFORM_ID))
  readonly #provider = inject(InertiaRuntime).headManager.createProvider()
  #view: EmbeddedViewRef<unknown> | null = null

  readonly title = input<string | undefined>(undefined)

  constructor() {
    afterRenderEffect(() => this.#update())
    this.#destroyRef.onDestroy(() => {
      if (this.#view) {
        this.#applicationRef.detachView(this.#view)
        this.#view.destroy()
      }
      if (this.#isBrowser) this.#provider.disconnect()
    })
  }

  ngAfterViewInit(): void {
    this.#view = this.#template.createEmbeddedView({})
    this.#applicationRef.attachView(this.#view)
    this.#view.detectChanges()
    this.#provider.reconnect()
    this.#update()
  }

  #update(): void {
    if (!this.#view) return
    this.#view.detectChanges()
    const elements = this.#view.rootNodes
      .filter((node): node is Element => node?.nodeType === 1)
      .map((element) => {
        const serialized = element.cloneNode(true) as Element
        const key = serialized.getAttribute('head-key') ?? ''
        serialized.removeAttribute('head-key')
        serialized.setAttribute('data-inertia', key)
        return serialized.outerHTML
      })

    if (this.title() && !elements.some((tag) => tag.startsWith('<title'))) {
      elements.push(`<title data-inertia="">${escape(this.title()!)}</title>`)
    }
    this.#provider.update(elements)
  }
}
