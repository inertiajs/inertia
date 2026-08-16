import { AfterViewInit, Component, DestroyRef, ViewContainerRef, inject, viewChild } from '@angular/core'
import { InertiaRenderer } from './renderer'
import { InertiaRuntime } from './runtime'
import { INERTIA_APP_PROPS } from './tokens'

@Component({
  selector: 'inertia-app',
  template: '<ng-container #outlet />',
})
export class App implements AfterViewInit {
  private readonly outlet = viewChild.required('outlet', { read: ViewContainerRef })
  readonly #renderer = inject(InertiaRenderer)
  readonly #runtime = inject(InertiaRuntime)
  readonly #props = inject(INERTIA_APP_PROPS)
  readonly #destroyRef = inject(DestroyRef)

  ngAfterViewInit(): void {
    const outlet = this.outlet()
    const disconnectRenderer = this.#runtime.connectRenderer(() =>
      this.#renderer.render(
        outlet,
        this.#runtime.component(),
        this.#runtime.page(),
        this.#runtime.key(),
        this.#runtime.layoutProps(),
        this.#props.defaultLayout,
      ),
    )
    this.#destroyRef.onDestroy(disconnectRenderer)
  }
}
