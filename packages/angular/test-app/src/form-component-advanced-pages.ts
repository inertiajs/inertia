import { ApplicationRef, Component, DestroyRef, afterNextRender, computed, inject, input, signal } from '@angular/core'
import { Form, Link, type InertiaFormComponent, type ResolvedComponent } from '@inertiajs/angular'
import type {
  CancelToken,
  FormComponentOptions,
  FormDataConvertible,
  Method,
  Page,
  UrlMethodPair,
} from '@inertiajs/core'

type TestForm = InertiaFormComponent<Record<string, FormDataConvertible>>

@Component({
  selector: 'test-form-events',
  imports: [Form],
  template: `
    <form
      inertiaForm
      #form="inertiaForm"
      [action]="action()"
      method="post"
      [onBefore]="onBefore"
      [onCancelToken]="onCancelToken"
      [onStart]="onStart"
      [onProgress]="onProgress"
      [onFinish]="onFinish"
      [onCancel]="onCancel"
      [onSuccess]="onSuccess"
      [onError]="onError"
    >
      <h1>Form Events & State</h1>
      <div>
        Events: <span id="events">{{ events().join(',') }}</span>
      </div>
      <div>
        Processing: <span id="processing">{{ form.processing() }}</span>
      </div>
      <div>
        Progress:
        <span id="progress" [class.uploading]="form.progress()?.percentage">{{
          form.progress()?.percentage || 0
        }}</span>
      </div>
      <div>
        Was successful: <span id="was-successful">{{ form.wasSuccessful() }}</span>
      </div>
      <div>
        Recently successful: <span id="recently-successful">{{ form.recentlySuccessful() }}</span>
      </div>
      <input type="file" name="avatar" id="avatar" />
      <button type="button" (click)="cancelInOnBefore.set(true)">Cancel in onBefore</button>
      <button type="button" (click)="shouldFail.set(true)">Fail Request</button>
      <button type="button" (click)="shouldDelay.set(true)">Should Delay</button>
      <button type="button" (click)="cancelVisit()">Cancel Visit</button>
      <button type="submit">Submit</button>
    </form>
  `,
})
class EventsPage {
  readonly events = signal<string[]>([])
  readonly cancelInOnBefore = signal(false)
  readonly shouldFail = signal(false)
  readonly shouldDelay = signal(false)
  readonly action = computed(() =>
    this.shouldFail()
      ? '/form-component/events/errors'
      : this.shouldDelay()
        ? '/form-component/events/delay'
        : '/form-component/events/success',
  )
  #cancelToken: CancelToken | null = null
  readonly log = (event: string): void => this.events.update((events) => [...events, event])
  readonly onBefore = (): boolean | void => {
    this.log('onBefore')
    if (this.cancelInOnBefore()) {
      this.log('onCancel')
      return false
    }
  }
  readonly onCancelToken = (token: CancelToken): void => {
    this.log('onCancelToken')
    this.#cancelToken = token
  }
  readonly onStart = (): void => this.log('onStart')
  readonly onProgress = (): void => this.log('onProgress')
  readonly onFinish = (): void => this.log('onFinish')
  readonly onCancel = (): void => this.log('onCancel')
  readonly onSuccess = (): void => this.log('onSuccess')
  readonly onError = (): void => this.log('onError')
  cancelVisit(): void {
    this.#cancelToken?.cancel()
    this.#cancelToken = null
  }
}

@Component({
  selector: 'test-form-options',
  imports: [Form],
  template: `
    <form inertiaForm [action]="action()" [method]="method()" [options]="options()" [queryStringArrayFormat]="arrayFormat()">
      <h1>Form Options</h1>
      <input type="text" name="tags[]" value="alpha" /><input type="text" name="tags[]" value="beta" />
      <div>State: <span id="state">{{ state() }}</span></div>
      <button type="button" (click)="only.set(['users'])">Set Only (users)</button>
      <button type="button" (click)="except.set(['stats'])">Set Except (stats)</button>
      <button type="button" (click)="reset.set(['orders'])">Set Reset (orders)</button>
      <button type="button" (click)="format.set('brackets')">Use Brackets Format</button>
      <button type="button" (click)="format.set('indices')">Use Indices Format</button>
      <button type="button" (click)="enablePreserveScroll()">Enable Preserve Scroll</button>
      <button type="button" (click)="enablePreserveState()">Enable Preserve State</button>
      <button type="button" (click)="preserveUrl.set(true)">Enable Preserve Url</button>
      <button type="button" (click)="replace.set(true)">Enable Replace</button>
      <button type="submit">Submit</button>
    </form>
    @if (preserveScroll()) { <div style="height: 1400px">Article content</div> }
  `,
})
class OptionsPage {
  readonly #appRef = inject(ApplicationRef)
  readonly only = signal<string[]>([])
  readonly except = signal<string[]>([])
  readonly reset = signal<string[]>([])
  readonly replace = signal(false)
  readonly state = signal('Default State')
  readonly preserveScroll = signal(false)
  readonly preserveState = signal(false)
  readonly preserveUrl = signal(false)
  readonly format = signal<'brackets' | 'indices' | null>(null)
  readonly arrayFormat = computed<'brackets' | 'indices'>(() => this.format() ?? 'brackets')
  readonly action = computed(() =>
    this.preserveScroll()
      ? '/article'
      : this.preserveState()
        ? '/form-component/options'
        : this.preserveUrl()
          ? '/form-component/options?page=2'
          : this.format()
            ? '/dump/get'
            : '/dump/post',
  )
  readonly method = computed<Method>(() =>
    this.preserveScroll() || this.preserveState() || this.preserveUrl() || this.format() ? 'get' : 'post',
  )
  readonly options = computed<FormComponentOptions>(() => ({
    only: this.only(),
    except: this.except(),
    reset: this.reset(),
    replace: this.replace(),
    preserveScroll: this.preserveScroll(),
    preserveState: this.preserveState(),
    preserveUrl: this.preserveUrl(),
  }))
  enablePreserveScroll(): void {
    this.preserveScroll.set(true)
    this.#appRef.tick()
  }
  enablePreserveState(): void {
    this.preserveState.set(true)
    this.state.set('Replaced State')
    this.#appRef.tick()
  }
}

@Component({
  selector: 'test-form-progress',
  imports: [Form],
  template: `
    <form inertiaForm action="/form-component/progress" method="post" [showProgress]="showProgress()">
      <h1>Progress</h1>
      <div>
        Nprogress appearances: <span id="nprogress-appearances">{{ appearances() }}</span>
      </div>
      <button type="button" (click)="showProgress.set(false)">Disable Progress</button>
      <button type="submit">Submit</button>
    </form>
  `,
})
class ProgressPage {
  readonly showProgress = signal(true)
  readonly appearances = signal(0)
  #visible = false

  constructor() {
    const destroyRef = inject(DestroyRef)
    afterNextRender(() => {
      const observer = new MutationObserver(() => {
        const element = document.querySelector('#nprogress') as HTMLElement | null
        const visible = Boolean(
          element &&
          ('popover' in HTMLElement.prototype ? element.matches(':popover-open') : element.style.display !== 'none'),
        )
        if (visible && !this.#visible) this.appearances.update((count) => count + 1)
        this.#visible = visible
      })
      observer.observe(document.body, { childList: true, subtree: true })
      destroyRef.onDestroy(() => observer.disconnect())
    })
  }
}

@Component({
  selector: 'test-form-methods',
  imports: [Form],
  template: `
    <h1>HTTP Methods</h1>
    <button type="button" (click)="method.set('get')">GET</button
    ><button type="button" (click)="method.set('post')">POST</button>
    <button type="button" (click)="method.set('put')">PUT</button
    ><button type="button" (click)="method.set('patch')">PATCH</button>
    <button type="button" (click)="method.set('delete')">DELETE</button>
    <form inertiaForm [action]="'/dump/' + method()" [method]="method()">
      <input name="name" value="John Doe" /><input type="checkbox" name="active" value="true" checked />
      <button type="submit">Submit {{ method().toUpperCase() }}</button>
    </form>
  `,
})
class MethodsPage {
  readonly method = signal<Method>('get')
}

@Component({
  selector: 'test-form-transform',
  imports: [Form],
  template: `
    <h1>Transform Function</h1>
    <button type="button" (click)="transformType.set('none')">None</button>
    <button type="button" (click)="transformType.set('uppercase')">Uppercase</button>
    <button type="button" (click)="transformType.set('format')">Format</button>
    <form inertiaForm action="/dump/post" method="post" [transform]="transform()">
      <input name="name" value="John Doe" /><input name="firstName" value="John" /><input name="lastName" value="Doe" />
      <button type="submit">Submit with Transform</button>
    </form>
  `,
})
class TransformPage {
  readonly transformType = signal<'none' | 'uppercase' | 'format'>('none')
  readonly transform = computed(
    () =>
      (data: Record<string, FormDataConvertible>): Record<string, FormDataConvertible> => {
        if (this.transformType() === 'uppercase') return { ...data, name: String(data['name']).toUpperCase() }
        if (this.transformType() === 'format') return { ...data, fullName: `${data['firstName']} ${data['lastName']}` }
        return data
      },
  )
}

@Component({
  selector: 'test-form-dotted',
  imports: [Form],
  template: `
    <h1>Dotted Keys Form Test</h1>
    <form inertiaForm action="/dump/post" method="post">
      <input name="user.name" /><input name="user.profile.city" /> <input name="user.skills[]" /><input
        name="user.skills[]"
      /><input name="company.address.street" />
      <button type="submit">Submit Basic</button>
    </form>
    <form inertiaForm action="/dump/post" method="post">
      <input name="config\\.app\\.name" /><input name="settings.theme\\.mode" />
      <button type="submit">Submit Escaped</button>
    </form>
    <form inertiaForm action="/dump/post" method="post">
      <input name="user[roles][]" value="admin" /><input name="user[roles][]" value="editor" /><input
        name="settings.ui.theme"
      />
      <button type="submit">Submit Mixed</button>
    </form>
  `,
})
class DottedKeysPage {}

@Component({
  selector: 'test-form-ref',
  imports: [Form],
  template: `
    <h1>Form Ref Test</h1>
    <form inertiaForm #form="inertiaForm" action="/dump/post" method="post">
      <div>Form is {{ form.isDirty() ? 'dirty' : 'clean' }}</div>
      @if (form.hasErrors()) {
        <div>Form has errors</div>
      }
      @if (form.errors()['name']) {
        <div id="error_name">{{ form.errors()['name'] }}</div>
      }
      <input name="name" value="John Doe" /><input type="email" name="email" value="john@example.com" />
      <button type="submit">Submit via Form</button>
    </form>
    <button type="button" (click)="form.submit()">Submit Programmatically</button>
    <button type="button" (click)="form.reset()">Reset Form</button>
    <button type="button" (click)="form.reset('name')">Reset Name Field</button>
    <button type="button" (click)="form.clearErrors()">Clear Errors</button>
    <button type="button" (click)="form.setError('name', 'This is a test error')">Set Test Error</button>
    <button type="button" (click)="form.defaults()">Set Current as Defaults</button>
    <button type="button" (click)="callPrecognition(form)">Call Precognition Methods</button>
  `,
})
class RefPage {
  callPrecognition(form: TestForm): void {
    if (!form.touched('company') && !form.valid('company')) form.validate({ only: ['company'] })
  }
}

@Component({
  selector: 'test-form-uppercase',
  imports: [Form],
  template: `
    <form inertiaForm action="/dump/post" method="POST">
      <input name="name" value="Test POST" /><button>Submit POST</button>
    </form>
    <form inertiaForm action="/dump/get" method="GET">
      <input name="query" value="Test GET" /><button>Submit GET</button>
    </form>
    <form inertiaForm action="/dump/put" method="PUT">
      <input name="data" value="Test PUT" /><button>Submit PUT</button>
    </form>
  `,
})
class UppercaseMethodPage {}

@Component({
  selector: 'test-form-wayfinder',
  imports: [Form],
  template: `<form inertiaForm [action]="action">
    <input name="name" value="John Doe" /><input type="checkbox" name="active" value="true" checked /><button>
      Submit
    </button>
  </form>`,
})
class WayfinderPage {
  readonly action: UrlMethodPair = { url: '/dump/post', method: 'post' }
}

@Component({
  selector: 'test-form-data-methods',
  imports: [Form],
  template: `
    <form inertiaForm #form="inertiaForm">
      <input id="name" name="name" />
      <button type="button" (click)="testGetData(form)">Test getData()</button>
      <button type="button" (click)="testGetFormData(form)">Test getFormData()</button>
    </form>
  `,
})
class DataMethodsPage {
  testGetData(form: TestForm): void {
    console.log('getData result: ' + JSON.stringify(form.getData()))
  }
  testGetFormData(form: TestForm): void {
    console.log('getFormData entries: ' + JSON.stringify(Object.fromEntries(form.getFormData().entries())))
  }
}

@Component({
  selector: 'test-form-mixed-keys',
  imports: [Form],
  template: `
    <form inertiaForm action="/dump/post" method="post">
      <input name="fields[entries][100][name]" value="John Doe" /><input
        name="fields[entries][100][email]"
        value="john@example.com"
      />
      <input name="fields[entries][new:1][name]" value="Jane Smith" /><input
        name="fields[entries][new:1][email]"
        value="jane@example.com"
      />
      <button>Submit</button>
    </form>
  `,
})
class MixedKeySerializationPage {}

@Component({
  selector: 'test-form-submit-button',
  imports: [Form],
  template: `<form inertiaForm action="/dump/post" method="post">
    <input name="name" value="John Doe" /> <button name="action" value="save" id="save-button">Save</button
    ><button name="action" value="draft" id="draft-button">Save as Draft</button>
    <button id="no-name-button">Submit Without Name</button>
  </form>`,
})
class SubmitButtonPage {}

@Component({
  selector: 'test-form-target',
  imports: [Form],
  template: `<form inertiaForm action="/non-inertia/download" method="get">
    <input name="search" value="test-query" />
    <button formtarget="_blank" name="format" value="csv" id="button-blank">Button with formTarget blank</button>
    <input type="submit" formtarget="_blank" name="type" value="export" id="input-blank" />
  </form>`,
})
class FormTargetPage {}

@Component({
  selector: 'test-form-invalidate-tags',
  imports: [Form, Link],
  template: `
    <a inertiaLink href="/prefetch/tags/1" prefetch="hover" [cacheTags]="tag('user')">User Tagged Page</a>
    <a inertiaLink href="/prefetch/tags/2" prefetch="hover" [cacheTags]="tag('product')">Product Tagged Page</a>
    <form inertiaForm action="/dump/post" method="post" [invalidateCacheTags]="tag('user')">
      <input id="form-name" name="name" /><button id="submit-invalidate-user">Submit (Invalidate User Tags)</button>
    </form>
    <div>
      Last loaded at <span id="last-loaded">{{ lastLoaded() }}</span>
    </div>
  `,
})
class InvalidateTagsPage {
  readonly lastLoaded = input(0)
  readonly propType = input('string')
  tag(value: string): string | string[] {
    return this.propType() === 'string' ? value : [value]
  }
}

type Todo = { id: number; name: string; done: boolean }
@Component({
  selector: 'test-form-optimistic',
  imports: [Form],
  template: `
    <form
      inertiaForm
      #form="inertiaForm"
      method="post"
      action="/form-component/optimistic"
      [optimistic]="optimistic"
      [options]="preserveScroll"
    >
      <input id="name-input" name="name" /><button id="submit-btn" [disabled]="form.processing()">Add Todo</button>
    </form>
    <ul id="todo-list">
      @for (todo of todos(); track todo.id) {
        <li>{{ todo.name }}</li>
      }
    </ul>
    <div id="todo-count">Count: {{ todos().length }}</div>
  `,
})
class OptimisticPage {
  readonly todos = input<Todo[]>([])
  readonly preserveScroll: FormComponentOptions = { preserveScroll: true }
  readonly optimistic = (props: Page['props'], data: Record<string, FormDataConvertible>): Partial<Page['props']> => ({
    todos: [
      ...(props['todos'] as Todo[]),
      { id: Date.now(), name: String(data['name'] || '(empty todo...)'), done: false },
    ],
  })
}

@Component({
  selector: 'test-form-view-transition',
  imports: [Form],
  template: `<form inertiaForm action="/form-component/view-transition" method="post" [options]="options">
    <button>Submit with View Transition</button>
  </form>`,
})
class ViewTransitionPage {
  readonly options: FormComponentOptions = {
    viewTransition: (transition) => {
      transition.ready.then(() => console.log('ready'))
      transition.updateCallbackDone.then(() => console.log('updateCallbackDone'))
      transition.finished.then(() => console.log('finished'))
    },
  }
}

export const formComponentAdvancedPages: Record<string, ResolvedComponent> = {
  'FormComponent/Events': EventsPage,
  'FormComponent/Options': OptionsPage,
  'FormComponent/Progress': ProgressPage,
  'FormComponent/Methods': MethodsPage,
  'FormComponent/Transform': TransformPage,
  'FormComponent/DottedKeys': DottedKeysPage,
  'FormComponent/Ref': RefPage,
  'FormComponent/UppercaseMethod': UppercaseMethodPage,
  'FormComponent/Wayfinder': WayfinderPage,
  'FormComponent/DataMethods': DataMethodsPage,
  'FormComponent/MixedKeySerialization': MixedKeySerializationPage,
  'FormComponent/SubmitButton': SubmitButtonPage,
  'FormComponent/FormTarget': FormTargetPage,
  'FormComponent/InvalidateTags': InvalidateTagsPage,
  'FormComponent/Optimistic': OptimisticPage,
  'FormComponent/ViewTransition': ViewTransitionPage,
}
