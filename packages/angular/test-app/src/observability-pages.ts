import { Component, DestroyRef, inject, signal } from '@angular/core'
import { http, progress, router, type ResolvedComponent } from '@inertiajs/angular'

@Component({
  selector: 'test-error-modal',
  template:
    '<span class="invalid-visit" (click)="router.post(\'/non-inertia\')">Invalid Visit</span><span class="invalid-visit-json" (click)="router.post(\'/json\')">Invalid Visit (JSON response)</span><span class="invalid-visit-xss" (click)="router.post(\'/non-inertia/xss\')">Invalid Visit (XSS)</span>',
})
class ErrorModal {
  readonly router = router
}

@Component({
  selector: 'test-network-error',
  template:
    '<h1>Network Error</h1>@if (error()) { <div id="network-error">Network error occurred</div> }<button id="make-request" type="button" (click)="request()">Make Request</button>',
})
class NetworkError {
  readonly error = signal(false)
  request(): void {
    this.error.set(false)
    router.get('/network-error', {}, { onNetworkError: () => this.error.set(true) })
  }
}

@Component({
  selector: 'test-progress-component',
  template: `
    <h1>Progress API Test</h1>
    <button type="button" (click)="start()">Start</button
    ><button type="button" (click)="set(0.25, 'set 25%')">Set 25%</button
    ><button type="button" (click)="set(0.5, 'set 50%')">Set 50%</button
    ><button type="button" (click)="set(0.75, 'set 75%')">Set 75%</button
    ><button type="button" (click)="finish()">Finish</button> <button type="button" (click)="reset()">Reset</button
    ><button type="button" (click)="remove()">Remove</button><button type="button" (click)="hide()">Hide</button
    ><button type="button" (click)="reveal()">Reveal</button>
    <button type="button" (click)="log('isStarted:', progress.isStarted())">Is Started</button
    ><button type="button" (click)="log('getStatus:', progress.getStatus())">Get Status</button
    ><button type="button" (click)="clear()">Clear</button>
    <div>
      Logs: <span id="logs">{{ logs().join(', ') }}</span>
    </div>
  `,
})
class ProgressComponent {
  readonly logs = signal<string[]>([])
  readonly progress = progress
  constructor() {
    window.progressTests = []
  }
  log(...args: unknown[]): void {
    window.progressTests.push(...args)
    this.logs.update((items) => [...items, args.join(' ')])
  }
  start(): void {
    progress.start()
    this.log('started')
  }
  set(value: number, message: string): void {
    progress.set(value)
    this.log(message)
  }
  finish(): void {
    progress.finish()
    this.log('finished')
  }
  reset(): void {
    progress.reset()
    this.log('reset')
  }
  remove(): void {
    progress.remove()
    this.log('removed')
  }
  hide(): void {
    progress.hide()
    this.log('hidden')
  }
  reveal(): void {
    progress.reveal()
    this.log('revealed')
  }
  clear(): void {
    window.progressTests = []
    this.logs.set([])
  }
}

@Component({
  selector: 'test-http-handlers',
  template: `
    <h1>HTTP Handlers</h1>
    <button type="button" (click)="registerRequest()">Register Request Handler</button
    ><button type="button" (click)="registerResponse()">Register Response Handler</button
    ><button type="button" (click)="registerError()">Register Error Handler</button
    ><button type="button" (click)="registerParams()">Register Params Handler</button
    ><button type="button" (click)="unregisterAll()">Unregister All</button
    ><button type="button" (click)="router.get('/dump/get')">Make Request</button
    ><button type="button" (click)="router.get('/http-handlers/error')">Make Error Request</button>
  `,
})
class HttpHandlers {
  readonly router = router
  constructor() {
    const destroyRef = inject(DestroyRef)
    window._http_handler_messages ??= []
    window._http_handler_unsubscribers ??= []
    destroyRef.onDestroy(() => window._http_handler_unsubscribers.forEach((unsubscribe) => unsubscribe()))
  }
  registerRequest(): void {
    this.#keep(
      http.onRequest((config) => {
        window._http_handler_messages.push('request-handler-called')
        return { ...config, headers: { ...config.headers, 'X-Custom-Header': 'custom-value' } }
      }),
    )
  }
  registerResponse(): void {
    this.#keep(
      http.onResponse((response) => {
        window._http_handler_messages.push(`response-handler-called:${response.status}`)
        return response
      }),
    )
  }
  registerError(): void {
    this.#keep(
      http.onError((error) => {
        window._http_handler_messages.push(`error-handler-called:${error.name}`)
      }),
    )
  }
  registerParams(): void {
    this.#keep(
      http.onRequest((config) => {
        window._http_handler_messages.push('params-handler-called')
        return { ...config, params: { foo: 'bar', baz: 'qux' } }
      }),
    )
  }
  unregisterAll(): void {
    window._http_handler_unsubscribers.forEach((unsubscribe) => unsubscribe())
    window._http_handler_unsubscribers = []
    window._http_handler_messages.push('unregistered')
  }
  #keep(unsubscribe: () => void): void {
    window._http_handler_unsubscribers.push(unsubscribe)
  }
}

export const observabilityPages: Record<string, ResolvedComponent> = {
  ErrorModal,
  NetworkError,
  ProgressComponent,
  HttpHandlers,
}
