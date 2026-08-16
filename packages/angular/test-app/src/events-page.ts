import { Component, input } from '@angular/core'
import { Link, router, usePage, type ResolvedComponent } from '@inertiajs/angular'
import type { CancelToken, VisitOptions } from '@inertiajs/core'

@Component({
  selector: 'test-events',
  imports: [Link],
  template: `
    <div>
      <a href="#" class="without-listeners" (click)="withoutEventListeners($event)">Basic Visit</a>
      <a href="#" class="remove-inertia-listener" (click)="removeInertiaListener($event)">Remove Inertia Listener</a>
      <a href="#" class="register-inertia-once-listener" (click)="onceInertiaListener($event)"
        >Register Inertia Once Listener</a
      >
      <a href="#" class="remove-inertia-once-listener" (click)="removeOnceInertiaListener($event)"
        >Remove Inertia Once Listener</a
      >

      <a href="#" class="before" (click)="beforeVisit($event)">Before Event</a>
      <a href="#" class="before-prevent-local" (click)="beforeVisitPreventLocal($event)">Before Event (Prevent)</a>
      <button
        inertiaLink
        [href]="page().url"
        method="post"
        [onBefore]="linkBefore"
        [onStart]="linkStart"
        class="link-before"
      >
        Before Event Link
      </button>
      <button
        inertiaLink
        [href]="page().url"
        method="post"
        [onBefore]="linkBeforePrevent"
        [onStart]="unexpected"
        class="link-before-prevent-local"
      >
        Before Event Link (Prevent)
      </button>
      <a href="#" class="before-prevent-global-inertia" (click)="beforeVisitPreventGlobalInertia($event)"
        >Before Event - Prevent globally using Inertia Event Listener</a
      >
      <a href="#" class="before-prevent-global-native" (click)="beforeVisitPreventGlobalNative($event)"
        >Before Event - Prevent globally using Native Event Listeners</a
      >

      <a href="#" class="canceltoken" (click)="cancelTokenVisit($event)">Cancel Token Event</a>
      <button inertiaLink [href]="page().url" method="post" [onCancelToken]="linkCancelToken" class="link-canceltoken">
        Cancel Token Event Link
      </button>

      <a href="#" class="cancel" (click)="cancelVisit($event)">Cancel Event</a>
      <button
        inertiaLink
        [href]="page().url"
        method="post"
        [onCancelToken]="cancelImmediately"
        [onCancel]="linkCancel"
        class="link-cancel"
      >
        Cancel Event Link
      </button>

      <a href="#" class="start" (click)="startVisit($event)">Start Event</a>
      <button inertiaLink [href]="page().url" method="post" [onStart]="linkStartWithVisit" class="link-start">
        Start Event Link
      </button>

      <a href="#" class="progress" (click)="progressVisit($event)">Progress Event</a>
      <a href="#" class="progress-no-files" (click)="progressNoFilesVisit($event)">Missing Progress Event (no files)</a>
      <button
        inertiaLink
        [href]="page().url"
        method="post"
        [data]="payloadWithFile"
        [onProgress]="linkProgress"
        class="link-progress"
      >
        Progress Event Link
      </button>
      <button
        inertiaLink
        [href]="page().url"
        method="post"
        [onBefore]="linkProgressNoFilesBefore"
        [onProgress]="linkProgress"
        class="link-progress-no-files"
      >
        Progress Event Link (no files)
      </button>

      <a href="#" class="error" (click)="errorVisit($event)">Error Event</a>
      <a href="#" class="error-promise" (click)="errorPromiseVisit($event)"
        >Error Event (delaying onFinish w/ Promise)</a
      >
      <button
        inertiaLink
        href="/events/errors"
        method="post"
        [onError]="linkError"
        [onSuccess]="unexpected"
        class="link-error"
      >
        Error Event Link
      </button>
      <button
        inertiaLink
        href="/events/errors"
        method="post"
        [onError]="linkErrorPromise"
        [onSuccess]="unexpected"
        [onFinish]="linkFinish"
        class="link-error-promise"
      >
        Error Event Link (delaying onFinish w/ Promise)
      </button>

      <a href="#" class="success" (click)="successVisit($event)">Success Event</a>
      <a href="#" class="success-promise" (click)="successPromiseVisit($event)"
        >Success Event (delaying onFinish w/ Promise)</a
      >
      <button
        inertiaLink
        [href]="page().url"
        method="post"
        [onError]="unexpected"
        [onSuccess]="linkSuccess"
        class="link-success"
      >
        Success Event Link
      </button>
      <button
        inertiaLink
        [href]="page().url"
        method="post"
        [onError]="unexpected"
        [onSuccess]="linkSuccessPromise"
        [onFinish]="linkFinish"
        class="link-success-promise"
      >
        Success Event Link (delaying onFinish w/ Promise)
      </button>

      <a href="#" class="http-exception" (click)="httpExceptionVisit($event)">HTTP Exception Event</a>
      <a href="#" class="http-exception-prevent" (click)="httpExceptionPreventVisit($event)"
        >HTTP Exception Event (Prevent)</a
      >
      <a href="#" class="http-exception-inertia-response" (click)="httpExceptionInertiaResponseVisit($event)"
        >HTTP Exception Event (Inertia Response)</a
      >
      <a
        href="#"
        class="http-exception-inertia-response-prevent"
        (click)="httpExceptionInertiaResponsePreventVisit($event)"
        >HTTP Exception Event (Inertia Response Prevent)</a
      >

      <a href="#" class="network-error" (click)="networkErrorVisit($event)">Network Error Event</a>
      <a href="#" class="network-error-prevent" (click)="networkErrorPreventVisit($event)"
        >Network Error Event (Prevent)</a
      >

      <a href="#" class="finish" (click)="finishVisit($event)">Finish Event</a>
      <button inertiaLink [href]="page().url" method="post" [onFinish]="linkFinishWithVisit" class="link-finish">
        Finish Event Link
      </button>

      <a href="#" class="navigate" (click)="navigateVisit($event)">Navigate Event</a>

      <button
        inertiaLink
        href="/prefetch/2"
        prefetch="hover"
        [onPrefetching]="linkPrefetching"
        [onPrefetched]="linkPrefetched"
        class="link-prefetch-hover"
      >
        Prefetch Event Link (Hover)
      </button>

      <a href="#" class="lifecycle-success" (click)="lifecycleSuccess($event)">Lifecycle Success</a>
      <a href="#" class="lifecycle-error" (click)="lifecycleError($event)">Lifecycle Error</a>
      <a href="#" class="lifecycle-cancel" (click)="lifecycleCancel($event)">Lifecycle Cancel</a>
      <a href="#" class="lifecycle-cancel-after-finish" (click)="lifecycleCancelAfterFinish($event)"
        >Lifecycle Cancel - After Finish</a
      >
    </div>
  `,
})
class EventsPage {
  readonly page = usePage()
  readonly payloadWithFile = { file: new File(['foobar'], 'example.bin') }

  constructor() {
    window.messages = []
  }

  readonly unexpected = () => this.#alert('This listener should not have been called.')
  readonly linkBefore = (visit: unknown) => this.#alert('linkOnBefore', visit)
  readonly linkBeforePrevent = () => {
    this.#alert('linkOnBefore')
    return false
  }
  readonly linkStart = () => this.#alert('linkOnStart')
  readonly linkStartWithVisit = (visit: unknown) => this.#alert('linkOnStart', visit)
  readonly linkCancelToken = (token: CancelToken) => this.#alert('linkOnCancelToken', token)
  readonly cancelImmediately = (token: CancelToken) => token.cancel()
  readonly linkCancel = () => this.#alert('linkOnCancel', undefined)
  readonly linkProgress = (progress: unknown) => this.#alert('linkOnProgress', progress)
  readonly linkProgressNoFilesBefore = () => this.#alert('linkProgressNoFilesOnBefore')
  readonly linkError = (errors: unknown) => this.#alert('linkOnError', errors)
  readonly linkErrorPromise = () => this.#callbackPromise('linkOnError')
  readonly linkSuccess = (page: unknown) => this.#alert('linkOnSuccess', page)
  readonly linkSuccessPromise = () => this.#callbackPromise('linkOnSuccess')
  readonly linkFinish = () => this.#alert('linkOnFinish')
  readonly linkFinishWithVisit = (visit: unknown) => this.#alert('linkOnFinish', visit)
  readonly linkPrefetching = (visit: unknown) => this.#alert('linkOnPrefetching', visit)
  readonly linkPrefetched = (response: unknown, visit: unknown) => this.#alert('linkOnPrefetched', response, visit)

  withoutEventListeners(event: Event): void {
    event.preventDefault()
    router.post(this.page().url, {})
  }

  removeInertiaListener(event: Event): void {
    event.preventDefault()
    const remove = router.on('before', () => this.#alert('Inertia.on(before)'))
    this.#alert('Removing Inertia.on Listener')
    remove()
    router.post(this.page().url, {}, { onBefore: () => this.#alert('onBefore'), onStart: () => this.#alert('onStart') })
  }

  onceInertiaListener(event: Event): void {
    event.preventDefault()
    router.once('before', () => this.#alert('Inertia.once(before)'))
    router.post(this.page().url, {}, { onBefore: () => this.#alert('onBefore-1') })
    router.post(this.page().url, {}, { onBefore: () => this.#alert('onBefore-2') })
  }

  removeOnceInertiaListener(event: Event): void {
    event.preventDefault()
    const remove = router.once('before', () => this.#alert('Inertia.once(before)'))
    this.#alert('Removing Inertia.once Listener')
    remove()
    router.post(this.page().url, {}, { onBefore: () => this.#alert('onBefore') })
  }

  beforeVisit(event: Event): void {
    event.preventDefault()
    router.on('before', (value) => this.#alert('Inertia.on(before)', value))
    document.addEventListener('inertia:before', (value) => this.#alert('addEventListener(inertia:before)', value))
    router.post(
      this.page().url,
      {},
      {
        onBefore: (visit) => this.#alert('onBefore', visit),
        onStart: () => this.#alert('onStart'),
      },
    )
  }

  beforeVisitPreventLocal(event: Event): void {
    event.preventDefault()
    document.addEventListener('inertia:before', () => this.#alert('addEventListener(inertia:before)'))
    router.on('before', () => this.#alert('Inertia.on(before)'))
    router.post(
      this.page().url,
      {},
      {
        onBefore: () => {
          this.#alert('onBefore')
          return false
        },
        onStart: this.unexpected,
      },
    )
  }

  beforeVisitPreventGlobalInertia(event: Event): void {
    event.preventDefault()
    document.addEventListener('inertia:before', () => this.#alert('addEventListener(inertia:before)'))
    router.on('before', () => {
      this.#alert('Inertia.on(before)')
      return false
    })
    router.post(this.page().url, {}, { onBefore: () => this.#alert('onBefore'), onStart: this.unexpected })
  }

  beforeVisitPreventGlobalNative(event: Event): void {
    event.preventDefault()
    router.on('before', () => this.#alert('Inertia.on(before)'))
    document.addEventListener('inertia:before', (nativeEvent) => {
      this.#alert('addEventListener(inertia:before)')
      nativeEvent.preventDefault()
    })
    router.post(this.page().url, {}, { onBefore: () => this.#alert('onBefore'), onStart: this.unexpected })
  }

  cancelTokenVisit(event: Event): void {
    event.preventDefault()
    document.addEventListener('inertia:cancelToken', this.unexpected)
    router.post(this.page().url, {}, { onCancelToken: (token) => this.#alert('onCancelToken', token) })
  }

  cancelVisit(event: Event): void {
    event.preventDefault()
    router.on('cancel', (value) => this.#alert('Inertia.on(cancel)', value))
    document.addEventListener('inertia:cancel', (value) => this.#alert('addEventListener(inertia:cancel)', value))
    router.post(
      this.page().url,
      {},
      {
        onCancelToken: (token) => token.cancel(),
        onCancel: () => this.#alert('onCancel', undefined),
      },
    )
  }

  startVisit(event: Event): void {
    event.preventDefault()
    router.on('start', (value) => this.#alert('Inertia.on(start)', value))
    document.addEventListener('inertia:start', (value) => this.#alert('addEventListener(inertia:start)', value))
    router.post(this.page().url, {}, { onStart: (visit) => this.#alert('onStart', visit) })
  }

  progressVisit(event: Event): void {
    event.preventDefault()
    router.on('progress', (value) => this.#alert('Inertia.on(progress)', value))
    document.addEventListener('inertia:progress', (value) => this.#alert('addEventListener(inertia:progress)', value))
    router.post(this.page().url, this.payloadWithFile, {
      onProgress: (progress) => this.#alert('onProgress', progress),
    })
  }

  progressNoFilesVisit(event: Event): void {
    event.preventDefault()
    router.on('progress', (value) => this.#alert('Inertia.on(progress)', value))
    document.addEventListener('inertia:progress', (value) => this.#alert('addEventListener(inertia:progress)', value))
    router.post(
      this.page().url,
      {},
      {
        onBefore: () => this.#alert('progressNoFilesOnBefore'),
        onProgress: (progress) => this.#alert('onProgress', progress),
      },
    )
  }

  errorVisit(event: Event): void {
    event.preventDefault()
    router.on('error', (value) => this.#alert('Inertia.on(error)', value))
    document.addEventListener('inertia:error', (value) => this.#alert('addEventListener(inertia:error)', value))
    router.post('/events/errors', {}, { onError: (errors) => this.#alert('onError', errors) })
  }

  errorPromiseVisit(event: Event): void {
    event.preventDefault()
    router.post(
      '/events/errors',
      {},
      {
        onError: () => this.#callbackPromise('onError'),
        onSuccess: this.unexpected,
        onFinish: () => this.#alert('onFinish'),
      },
    )
  }

  successVisit(event: Event): void {
    event.preventDefault()
    router.on('success', (value) => this.#alert('Inertia.on(success)', value))
    document.addEventListener('inertia:success', (value) => this.#alert('addEventListener(inertia:success)', value))
    router.post(this.page().url, {}, { onError: this.unexpected, onSuccess: (page) => this.#alert('onSuccess', page) })
  }

  successPromiseVisit(event: Event): void {
    event.preventDefault()
    router.post(
      this.page().url,
      {},
      {
        onSuccess: () => this.#callbackPromise('onSuccess'),
        onError: this.unexpected,
        onFinish: () => this.#alert('onFinish'),
      },
    )
  }

  finishVisit(event: Event): void {
    event.preventDefault()
    router.on('finish', (value) => this.#alert('Inertia.on(finish)', value))
    document.addEventListener('inertia:finish', (value) => this.#alert('addEventListener(inertia:finish)', value))
    router.post(this.page().url, {}, { onFinish: (visit) => this.#alert('onFinish', visit) })
  }

  httpExceptionVisit(event: Event): void {
    event.preventDefault()
    this.#listenForHttpException()
    router.post('/non-inertia', {}, { onHttpException: () => this.#alert('onHttpException') })
  }

  httpExceptionPreventVisit(event: Event): void {
    event.preventDefault()
    this.#listenForHttpException()
    router.post(
      '/non-inertia',
      {},
      {
        onHttpException: (response) => {
          this.#alert('onHttpException', response)
          return false
        },
      },
    )
  }

  httpExceptionInertiaResponseVisit(event: Event): void {
    event.preventDefault()
    this.#listenForHttpException()
    router.get('/inertia-error-page', {}, { onHttpException: () => this.#alert('onHttpException') })
  }

  httpExceptionInertiaResponsePreventVisit(event: Event): void {
    event.preventDefault()
    this.#listenForHttpException()
    router.get(
      '/inertia-error-page',
      {},
      {
        onHttpException: (response) => {
          this.#alert('onHttpException', response)
          return false
        },
      },
    )
  }

  networkErrorVisit(event: Event): void {
    event.preventDefault()
    this.#listenForNetworkError()
    router.post('/disconnect', {}, { onNetworkError: () => this.#alert('onNetworkError') })
  }

  networkErrorPreventVisit(event: Event): void {
    event.preventDefault()
    this.#listenForNetworkError()
    router.post(
      '/disconnect',
      {},
      {
        onNetworkError: (error) => {
          this.#alert('onNetworkError', error)
          return false
        },
      },
    )
  }

  navigateVisit(event: Event): void {
    event.preventDefault()
    router.on('navigate', (value) => this.#alert('Inertia.on(navigate)', value))
    document.addEventListener('inertia:navigate', (value) => this.#alert('addEventListener(inertia:navigate)', value))
    router.get('/')
  }

  lifecycleSuccess(event: Event): void {
    event.preventDefault()
    router.post(this.page().url, this.payloadWithFile, this.#registerAllListeners())
  }

  lifecycleError(event: Event): void {
    event.preventDefault()
    router.post('/events/errors', this.payloadWithFile, this.#registerAllListeners())
  }

  lifecycleCancel(event: Event): void {
    event.preventDefault()
    router.post('/sleep', this.payloadWithFile, {
      ...this.#registerAllListeners(),
      onCancelToken: (token) => {
        this.#alert('onCancelToken')
        setTimeout(() => {
          this.#alert('CANCELLING!')
          token.cancel()
        }, 250)
      },
    })
  }

  lifecycleCancelAfterFinish(event: Event): void {
    event.preventDefault()
    let cancelToken: CancelToken | null = null
    router.post(this.page().url, this.payloadWithFile, {
      ...this.#registerAllListeners(),
      onCancelToken: (token) => {
        this.#alert('onCancelToken')
        cancelToken = token
      },
      onFinish: () => {
        this.#alert('onFinish', 'CANCELLING!')
        cancelToken?.cancel()
      },
    })
  }

  #registerAllListeners(): VisitOptions {
    router.on('before', () => this.#alert('Inertia.on(before)'))
    router.on('cancel', () => this.#alert('Inertia.on(cancel)'))
    router.on('start', () => this.#alert('Inertia.on(start)'))
    router.on('progress', () => this.#alert('Inertia.on(progress)'))
    router.on('error', () => this.#alert('Inertia.on(error)'))
    router.on('success', () => this.#alert('Inertia.on(success)'))
    router.on('httpException', () => this.#alert('Inertia.on(httpException)'))
    router.on('networkError', () => this.#alert('Inertia.on(networkError)'))
    router.on('finish', () => this.#alert('Inertia.on(finish)'))
    router.on('navigate', () => this.#alert('Inertia.on(navigate)'))
    for (const name of [
      'before',
      'cancelToken',
      'cancel',
      'start',
      'progress',
      'error',
      'success',
      'httpException',
      'networkError',
      'finish',
      'navigate',
    ]) {
      document.addEventListener(`inertia:${name}`, () => this.#alert(`addEventListener(inertia:${name})`))
    }
    return {
      onBefore: () => this.#alert('onBefore'),
      onCancelToken: () => this.#alert('onCancelToken'),
      onCancel: () => this.#alert('onCancel'),
      onStart: () => this.#alert('onStart'),
      onProgress: () => this.#alert('onProgress'),
      onError: () => this.#alert('onError'),
      onSuccess: () => this.#alert('onSuccess'),
      onHttpException: () => this.#alert('onHttpException'),
      onNetworkError: () => this.#alert('onNetworkError'),
      onFinish: () => this.#alert('onFinish'),
    }
  }

  #listenForHttpException(): void {
    router.on('httpException', (value) => this.#alert('Inertia.on(httpException)', value))
    document.addEventListener('inertia:httpException', (value) =>
      this.#alert('addEventListener(inertia:httpException)', value),
    )
  }

  #listenForNetworkError(): void {
    router.on('networkError', (value) => this.#alert('Inertia.on(networkError)', value))
    document.addEventListener('inertia:networkError', (value) =>
      this.#alert('addEventListener(inertia:networkError)', value),
    )
  }

  #callbackPromise(eventName: string): Promise<void> {
    this.#alert(eventName)
    setTimeout(() => this.#alert('onFinish should have been fired by now if Promise functionality did not work'), 5)
    return new Promise((resolve) => setTimeout(resolve, 20))
  }

  #alert(...values: unknown[]): void {
    window.messages.push(...values)
  }
}

@Component({ selector: 'test-error-page', template: '<div><h1>Error Page</h1><p id="status">{{ status() }}</p></div>' })
class ErrorPage {
  readonly status = input(0)
}

export const eventPages: Record<string, ResolvedComponent> = { Events: EventsPage, ErrorPage }
