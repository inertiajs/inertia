import { ApplicationRef, Component, DestroyRef, inject, input, signal } from '@angular/core'
import {
  Deferred,
  DeferredContent,
  DeferredFallback,
  InfiniteScroll,
  router,
  usePage,
  type ResolvedComponent,
} from '@inertiajs/angular'

declare global {
  interface Window {
    flashCount: number
    messages: unknown[]
  }
}

const json = (value: unknown): string => JSON.stringify(value)

function onFlash(callback: (flash: Record<string, unknown>) => void): void {
  const destroyRef = inject(DestroyRef)
  const remove = router.on('flash', (event) => callback(event.detail.flash))
  destroyRef.onDestroy(remove)
}

@Component({
  selector: 'test-flash-initial',
  template: `<span id="flash">{{ page().flash ? json(page().flash) : 'no-flash' }}</span
    ><span id="flash-events">{{ json(events()) }}</span>`,
})
class InitialFlashPage {
  readonly page = usePage()
  readonly events = signal<Record<string, unknown>[]>([])
  readonly json = json
  constructor() {
    onFlash((flash) => this.events.update((events) => [...events, flash]))
  }
}

@Component({
  selector: 'test-flash-partial',
  template: `
    <span id="flash">{{ json(page().flash) }}</span
    ><span id="flash-event-count">{{ eventCount() }}</span
    ><span id="count">{{ count() }}</span>
    <button type="button" (click)="reload('same')">Reload with same flash</button>
    <button type="button" (click)="reload('different')">Reload with different flash</button>
    <button type="button" (click)="reload('none')">Reload without flash</button>
  `,
})
class PartialFlashPage {
  readonly count = input(0)
  readonly page = usePage()
  readonly eventCount = signal(0)
  readonly json = json
  constructor() {
    onFlash(() => this.eventCount.update((count) => count + 1))
  }
  reload(flashType: string): void {
    router.reload({ only: ['count'], data: { flashType, count: Date.now() } })
  }
}

@Component({
  selector: 'test-flash-deferred',
  imports: [Deferred, DeferredContent, DeferredFallback],
  template: `
    <span id="flash">{{ json(page().flash) }}</span
    ><span id="flash-event-count">{{ eventCount() }}</span>
    <inertia-deferred data="data">
      <ng-template inertiaDeferredFallback><div id="loading">Loading...</div></ng-template>
      <ng-template inertiaDeferredContent
        ><div id="data">{{ data() }}</div></ng-template
      >
    </inertia-deferred>
  `,
})
class DeferredFlashPage {
  readonly data = input<string>()
  readonly page = usePage()
  readonly eventCount = signal(0)
  readonly json = json
  constructor() {
    onFlash(() => this.eventCount.update((count) => count + 1))
  }
}

type Users = { data: Array<{ id: number; name: string }> }
@Component({
  selector: 'test-flash-infinite',
  imports: [InfiniteScroll],
  template: `
    <span id="flash">{{ json(page().flash) }}</span
    ><span id="flash-event-count">{{ eventCount() }}</span>
    <div inertiaInfiniteScroll="users" style="display: grid; gap: 20px">
      @for (user of users().data; track user.id) {
        <div style="height: 15vh; border: 1px solid #ccc">{{ user.name }}</div>
      }
    </div>
  `,
})
class InfiniteFlashPage {
  readonly users = input<Users>({ data: [] })
  readonly page = usePage()
  readonly eventCount = signal(0)
  readonly json = json
  constructor() {
    onFlash(() => this.eventCount.update((count) => count + 1))
  }
}

@Component({
  selector: 'test-flash-events',
  template: `
    <span id="flash">{{ json(page().flash) }}</span>
    <a href="#" (click)="visitWithFlash($event)">Visit with flash</a>
    <a href="#" (click)="visitWithErrors($event)">Visit with errors and flash</a>
    <a href="#" (click)="visitWithoutFlash($event)">Visit without flash</a>
    <a href="#" (click)="navigateAway($event)">Navigate away</a>
  `,
})
class FlashEventsPage {
  readonly page = usePage()
  readonly json = json
  constructor() {
    window.messages = []
  }
  log(...messages: unknown[]): void {
    window.messages.push(...messages)
  }
  prevent(event: Event): void {
    event.preventDefault()
  }
  visitWithFlash(event: Event): void {
    this.prevent(event)
    router.on('flash', (flashEvent) => this.log('Inertia.on(flash)', flashEvent.detail.flash))
    document.addEventListener('inertia:flash', (flashEvent) =>
      this.log('addEventListener(inertia:flash)', (flashEvent as CustomEvent).detail.flash),
    )
    router.post(
      '/flash/events/with-data',
      {},
      {
        onFlash: (flash) => this.log('onFlash', flash),
        onSuccess: (page) => this.log('onSuccess', page.flash),
      },
    )
  }
  visitWithErrors(event: Event): void {
    this.prevent(event)
    router.on('flash', (flashEvent) => this.log('Inertia.on(flash)', flashEvent.detail.flash))
    router.post(
      '/flash/events/with-errors',
      {},
      {
        onFlash: (flash) => this.log('onFlash', flash),
        onError: (errors) => this.log('onError', errors),
      },
    )
  }
  visitWithoutFlash(event: Event): void {
    this.prevent(event)
    router.on('flash', () => this.log('Inertia.on(flash)'))
    document.addEventListener('inertia:flash', () => this.log('addEventListener(inertia:flash)'))
    router.post(
      '/flash/events/without-data',
      {},
      {
        onFlash: () => this.log('onFlash'),
        onSuccess: () => this.log('onSuccess'),
      },
    )
  }
  navigateAway(event: Event): void {
    this.prevent(event)
    router.get('/')
  }
}

@Component({
  selector: 'test-flash-client-visits',
  template: `
    <span id="flash">{{ json(page().flash) }}</span>
    <button type="button" (click)="withFlash()">With flash object</button>
    <button type="button" (click)="mergeFlash()">With flash function</button>
    <button type="button" (click)="withoutFlash()">Without flash</button>
  `,
})
class ClientSideFlashPage {
  readonly #appRef = inject(ApplicationRef)
  readonly page = usePage()
  readonly json = json
  constructor() {
    window.flashCount ??= 0
  }
  withFlash(): void {
    router.replace({ flash: { foo: 'bar' }, onFlash: () => window.flashCount++ })
    this.#appRef.tick()
  }
  mergeFlash(): void {
    router.flash((flash) => ({ ...flash, bar: 'baz' }))
    window.flashCount++
    router.replace({ flash: (flash) => flash })
    this.#appRef.tick()
  }
  withoutFlash(): void {
    router.replace({ props: (props) => ({ ...props }), onFlash: () => window.flashCount++ })
    this.#appRef.tick()
  }
}

@Component({
  selector: 'test-router-flash',
  template: `
    <span id="flash">{{ json(page().flash) }}</span>
    <button type="button" (click)="router.flash({ foo: 'bar' })">Set flash</button>
    <button type="button" (click)="router.flash('foo', 'bar')">Set flash key-value</button>
    <button type="button" (click)="merge()">Merge flash</button>
    <button type="button" (click)="router.flash(() => ({}))">Clear flash</button>
  `,
})
class RouterFlashPage {
  readonly #appRef = inject(ApplicationRef)
  readonly page = usePage()
  readonly router = router
  readonly json = json
  merge(): void {
    router.flash((flash) => ({ ...flash, bar: 'baz' }))
    this.#appRef.tick()
  }
}

export const flashPages: Record<string, ResolvedComponent> = {
  'Flash/InitialFlash': InitialFlashPage,
  'Flash/Partial': PartialFlashPage,
  'Flash/WithDeferred': DeferredFlashPage,
  'Flash/WithInfiniteScroll': InfiniteFlashPage,
  'Flash/Events': FlashEventsPage,
  'Flash/ClientSideVisits': ClientSideFlashPage,
  'Flash/RouterFlash': RouterFlashPage,
}
