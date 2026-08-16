import { Component, afterNextRender, input } from '@angular/core'
import { Link, useForm, usePage, type ResolvedComponent } from '@inertiajs/angular'
import type { UseFormSubmitOptions } from '@inertiajs/core'

const inputValue = (event: Event): string => (event.target as HTMLInputElement).value
const inputChecked = (event: Event): boolean => (event.target as HTMLInputElement).checked

type BasicFormData = { name: string; remember: boolean }

@Component({
  selector: 'test-form-helper-methods',
  template: `
    <input id="name" [value]="form.data().name" (input)="form.setData('name', value($event))" />
    <input
      id="remember"
      type="checkbox"
      [checked]="form.data().remember"
      (change)="form.setData('remember', checked($event))"
    />
    <button type="button" (click)="form.post('/dump/post')">POST form</button>
    <button type="button" (click)="form.put('/dump/put')">PUT form</button>
    <button type="button" (click)="form.patch('/dump/patch')">PATCH form</button>
    <button type="button" (click)="form.delete('/dump/delete')">DELETE form</button>
    <button type="button" (click)="form.submit('post', '/dump/post')">SUBMIT form</button>
    <button type="button" (click)="form.submit(submitTarget)">SUBMIT OBJECT form</button>
  `,
})
class FormHelperMethods {
  readonly form = useForm<BasicFormData>({ name: 'foo', remember: false })
  readonly submitTarget = { method: 'post' as const, url: '/dump/post' }
  readonly value = inputValue
  readonly checked = inputChecked
}

@Component({
  selector: 'test-form-helper-set-data',
  template: `
    <span id="current-code">{{ form.data().code }}</span
    ><span id="current-name">{{ form.data().name }}</span>
    <button type="button" (click)="setAndPost()">Set and POST</button>
    <button type="button" (click)="form.setData('code', 'dirty')">Dirty</button>
    <button type="button" (click)="resetAndPost()">Reset and POST</button>
    <button type="button" (click)="partialResetAndPost()">Partial reset and POST</button>
  `,
})
class FormHelperSetData {
  readonly form = useForm({ code: 'initial', name: 'initial-name' })
  setAndPost(): void {
    this.form.setData('code', '123456')
    this.form.post('/dump/post')
  }
  resetAndPost(): void {
    this.form.reset()
    this.form.post('/dump/post')
  }
  partialResetAndPost(): void {
    this.form.setData('code', 'changed-code')
    this.form.setData('name', 'changed-name')
    this.form.reset('code')
    this.form.post('/dump/post')
  }
}

@Component({
  selector: 'test-form-helper-transform',
  template: `
    <input id="name" [value]="form.data().name" (input)="form.setData('name', value($event))" />
    <input
      id="remember"
      type="checkbox"
      [checked]="form.data().remember"
      (change)="form.setData('remember', checked($event))"
    />
    <button type="button" (click)="submit('post', 'bar')">POST form</button>
    <button type="button" (click)="submit('put', 'baz')">PUT form</button>
    <button type="button" (click)="submit('patch', 'foo')">PATCH form</button>
    <button type="button" (click)="submit('delete', 'bar')">DELETE form</button>
  `,
})
class FormHelperTransform {
  readonly form = useForm<BasicFormData>({ name: 'foo', remember: false })
  readonly value = inputValue
  readonly checked = inputChecked
  submit(method: 'post' | 'put' | 'patch' | 'delete', name: string): void {
    this.form.transform((data) => ({ ...data, name }))
    this.form[method](`/dump/${method}`)
  }
}

type ErrorFormData = { name: string; handle: string; remember: boolean }

const errorFormTemplate = `
  <input id="name" [value]="form.data().name" (input)="form.setData('name', value($event))" />
  @if (form.errors().name; as error) { <span class="name_error">{{ error }}</span> }
  <input id="handle" [value]="form.data().handle" (input)="form.setData('handle', value($event))" />
  @if (form.errors().handle; as error) { <span class="handle_error">{{ error }}</span> }
  <input id="remember" type="checkbox" [checked]="form.data().remember" (change)="form.setData('remember', checked($event))" />
  @if (form.errors().remember; as error) { <span class="remember_error">{{ error }}</span> }
  <button type="button" (click)="submit()">Submit form</button>
  <button type="button" (click)="form.clearErrors()">Clear all errors</button>
  <button type="button" (click)="form.clearErrors('handle')">Clear one error</button>
  <button type="button" (click)="setErrors()">Set errors</button>
  <button type="button" (click)="form.setError('handle', 'Manually set Handle error')">Set one error</button>
  <button type="button" (click)="form.resetAndClearErrors()">Reset all</button>
  <button type="button" (click)="form.resetAndClearErrors('handle')">Reset handle</button>
  <span class="errors-status">Form has {{ form.hasErrors() ? '' : 'no ' }}errors</span>
`

@Component({ selector: 'test-form-helper-errors', template: errorFormTemplate })
class FormHelperErrors {
  readonly form = useForm<ErrorFormData>({ name: 'foo', handle: 'example', remember: false })
  readonly value = inputValue
  readonly checked = inputChecked
  submit(): void {
    this.form.post('/form-helper/errors')
  }
  setErrors(): void {
    this.form.setError({ name: 'Manually set Name error', handle: 'Manually set Handle error' })
  }
}

@Component({
  selector: 'test-form-helper-clear-errors',
  template: `
    <input id="name" [value]="form.data().name" (input)="form.setData('name', value($event))" />
    @if (form.errors().name; as error) {
      <span id="name-error">{{ error }}</span>
    }
    <input id="handle" [value]="form.data().handle" (input)="form.setData('handle', value($event))" />
    @if (form.errors().handle; as error) {
      <span id="handle-error">{{ error }}</span>
    }
    <button id="submit" type="button" (click)="form.post('/form-helper/errors/clear-on-resubmit')">Submit</button>
    <span class="errors-status">Form has {{ form.hasErrors() ? '' : 'no ' }}errors</span>
  `,
})
class FormHelperErrorsClear {
  readonly form = useForm({ name: '', handle: '' })
  readonly value = inputValue
}

@Component({
  selector: 'test-form-helper-dirty',
  template: `
    <div>Form is {{ form.isDirty() ? 'dirty' : 'clean' }}</div>
    <input id="name" [value]="form.data().name" (input)="form.setData('name', value($event))" />
    <button type="button" (click)="form.post('')">Submit form</button>
    <button type="button" (click)="form.setDefaults()">Defaults</button>
    <button type="button" (click)="dataAndDefaults()">Data and Defaults</button>
    <button type="button" (click)="pushValue()">Push Value</button>
    <button type="button" (click)="submitAndDefaults()">Submit and setDefaults</button>
    <button type="button" (click)="submitAndCustomDefaults()">Submit and setDefaults custom</button>
  `,
})
class FormHelperDirty {
  readonly form = useForm({ name: 'foo', foo: [] as string[] })
  readonly value = inputValue
  pushValue(): void {
    this.form.setData('foo', [...this.form.data().foo, 'bar'])
  }
  dataAndDefaults(): void {
    this.pushValue()
    this.form.setDefaults()
  }
  submitAndDefaults(): void {
    this.form.post('/form-helper/dirty/redirect-back', { onSuccess: () => this.form.setDefaults() })
  }
  submitAndCustomDefaults(): void {
    this.form.post('/form-helper/dirty/redirect-back', {
      onSuccess: () => this.form.setDefaults({ name: 'Custom Default', foo: [] }),
    })
  }
}

@Component({
  selector: 'test-form-helper-data',
  template: `
    <input id="name" [value]="form.data().name" (input)="form.setData('name', value($event))" />
    @if (form.errors().name; as error) {
      <span class="name_error">{{ error }}</span>
    }
    <input id="handle" [value]="form.data().handle" (input)="form.setData('handle', value($event))" />
    @if (form.errors().handle; as error) {
      <span class="handle_error">{{ error }}</span>
    }
    <input
      id="remember"
      type="checkbox"
      [checked]="form.data().remember"
      (change)="form.setData('remember', checked($event))"
    />
    @if (form.errors().remember; as error) {
      <span class="remember_error">{{ error }}</span>
    }
    <button type="button" (click)="form.post(page().url)">Submit form</button>
    <button type="button" (click)="submitAndReset()">Submit form and reset</button>
    <button type="button" (click)="form.reset()">Reset all data</button>
    <button type="button" (click)="form.reset('handle')">Reset one field</button>
    <button type="button" (click)="form.setDefaults()">Reassign current as defaults</button>
    <button type="button" (click)="form.setDefaults(objectDefaults)">Reassign default values</button>
    <button type="button" (click)="form.setDefaults('name', 'single value')">Reassign single default</button>
    <span class="errors-status">Form has {{ form.hasErrors() ? '' : 'no ' }}errors</span>
  `,
})
class FormHelperData {
  readonly form = useForm<ErrorFormData>({ name: 'foo', handle: 'example', remember: false })
  readonly page = usePage()
  readonly objectDefaults = { handle: 'updated handle', remember: true }
  readonly value = inputValue
  readonly checked = inputChecked
  submitAndReset(): void {
    this.form.post('/form-helper/data/redirect-back', { onSuccess: () => this.form.reset() })
  }
}

type User = { id: number; name: string; email: string }

@Component({
  selector: 'test-form-helper-remember-index',
  imports: [Link],
  template:
    "<h1>Users Index</h1><ul>@for (user of users(); track user.id) { <li><a inertiaLink [href]=\"'/remember/users/' + user.id + '/edit'\">Edit {{ user.name }}</a></li> }</ul>",
})
class FormHelperRememberIndex {
  readonly users = input<User[]>([])
}

@Component({
  selector: 'test-form-helper-remember-edit',
  template: `
    <h1>Edit User {{ user().id }}</h1>
    <input [value]="form.data().name" (input)="form.setData('name', value($event))" />
    <input type="email" [value]="form.data().email" (input)="form.setData('email', value($event))" />
  `,
})
class FormHelperRememberEdit {
  readonly page = usePage<{ user: User }>()
  readonly user = input<User>({ id: 0, name: '', email: '' })
  readonly form = useForm('EditUserForm', () => ({
    name: this.page().props.user.name,
    email: this.page().props.user.email,
  }))
  readonly value = inputValue
}

type EventFormData = { name: string; remember: boolean }
@Component({
  selector: 'test-form-helper-events',
  template: `
    <button type="button" (click)="form.post(page().url)">Submit form</button>
    <button type="button" (click)="successfulRequest()">Successful request</button>
    <button type="button" (click)="cancelledVisit()">Cancellable Visit</button>
    <button type="button" (click)="onBeforeVisit()">onBefore</button>
    <button type="button" (click)="onBeforeCancelled()">onBefore cancellation</button>
    <button type="button" (click)="onStartVisit()">onStart</button>
    <button type="button" (click)="onProgressVisit()">onProgress</button>
    <button type="button" (click)="onSuccessVisit()">onSuccess</button>
    <button type="button" (click)="onSuccessProgress()">onSuccess progress property</button>
    <button type="button" (click)="onSuccessProcessing()">onSuccess resets processing</button>
    <button type="button" (click)="onSuccessResetErrors()">onSuccess resets errors</button>
    <button type="button" (click)="onSuccessPromise()">onSuccess promise</button>
    <button type="button" (click)="onSuccessResetValue()">onSuccess resets value</button>
    <button type="button" (click)="onErrorVisit()">onError</button>
    <button type="button" (click)="onErrorProgress()">onError progress property</button>
    <button type="button" (click)="onErrorProcessing()">onError resets processing</button>
    <button type="button" (click)="errorsSetOnError()">Errors set on error</button>
    <button type="button" (click)="onErrorPromise()">onError promise</button>
    <button type="button" (click)="onCancelProcessing()">onCancel resets processing</button>
    <button type="button" (click)="onCancelProgress()">onCancel progress property</button>
    <button type="button" (click)="progressNoFiles()">progress no files</button>
    <span class="success-status">Form was {{ form.wasSuccessful() ? '' : 'not ' }}successful</span>
    <span class="recently-status">Form was {{ form.recentlySuccessful() ? '' : 'not ' }}recently successful</span>
    <input class="name-input" [value]="form.data().name" (input)="form.setData('name', value($event))" />
    <input
      class="remember-input"
      type="checkbox"
      [checked]="form.data().remember"
      (change)="form.setData('remember', checked($event))"
    />
  `,
})
class FormHelperEvents {
  readonly form = useForm<EventFormData>({ name: 'foo', remember: false })
  readonly page = usePage()
  readonly value = inputValue
  readonly checked = inputChecked

  constructor() {
    window.events = []
    window.data = []
    this.#pushData('processing', this.form.processing())
    this.#pushData('progress', this.form.progress())
    this.#pushData('errors', this.form.errors())
    this.#pushData('hasErrors', this.form.hasErrors())
  }

  successfulRequest(): void {
    this.form.post(this.page().url, this.#callbacks())
  }
  errorsSetOnError(): void {
    this.form.post('/form-helper/events/errors', this.#callbacks())
  }

  onBeforeVisit(): void {
    this.form.post(
      '/sleep',
      this.#callbacks({
        onBefore: (visit) => {
          this.#pushEvent('onBefore')
          this.#pushData('visit', visit)
        },
      }),
    )
  }

  onBeforeCancelled(): void {
    this.form.post(
      '/sleep',
      this.#callbacks({
        onBefore: () => {
          this.#pushEvent('onBefore')
          return false
        },
      }),
    )
  }

  onStartVisit(): void {
    this.form.post(
      '/form-helper/events',
      this.#callbacks({
        onStart: (visit) => {
          this.#pushEvent('onStart')
          this.#pushData('processing', this.form.processing())
          this.#pushData('visit', visit)
        },
      }),
    )
  }

  onProgressVisit(): void {
    this.form.transform((data) => ({ ...data, file: new File(['foobar'], 'example.bin') }))
    this.form.post(
      '/dump/post',
      this.#callbacks({
        onProgress: (progress) => {
          this.#pushEvent('onProgress')
          this.#pushData('progress', this.form.progress())
          this.#pushData('progressEvent', progress)
        },
      }),
    )
  }

  cancelledVisit(): void {
    this.form.post(
      '/sleep',
      this.#callbacks({
        onCancelToken: (token) => {
          this.#pushEvent('onCancelToken')
          setTimeout(() => {
            this.#pushEvent('CANCELLING!')
            token.cancel()
          }, 10)
        },
      }),
    )
  }

  onCancelProcessing(): void {
    this.#cancel(false)
  }
  onCancelProgress(): void {
    this.#cancel(true)
  }

  onSuccessVisit(): void {
    this.form.post(
      '/dump/post',
      this.#callbacks({
        onSuccess: (page) => {
          this.#pushEvent('onSuccess')
          this.#pushData('page', page)
        },
      }),
    )
  }

  onSuccessPromise(): void {
    this.form.post('/dump/post', this.#callbacks({ onSuccess: () => this.#delayed('onSuccess') }))
  }

  onErrorVisit(): void {
    this.form.post(
      '/form-helper/events/errors',
      this.#callbacks({
        onError: (errors) => {
          this.#pushEvent('onError')
          this.#pushData('errors', errors)
        },
      }),
    )
  }

  onErrorPromise(): void {
    this.form.post('/form-helper/events/errors', this.#callbacks({ onError: () => this.#delayed('onError') }))
  }

  onSuccessProcessing(): void {
    this.form.post(this.page().url, this.#callbacks())
  }
  onErrorProcessing(): void {
    this.form.post('/form-helper/events/errors', this.#callbacks())
  }

  onSuccessResetValue(): void {
    this.form.post(
      this.page().url,
      this.#callbacks({
        onSuccess: () => {
          this.#pushEvent('onSuccess')
          this.form.reset()
        },
      }),
    )
  }

  onSuccessProgress(): void {
    this.form.transform((data) => ({ ...data, file: new File(['foo'], 'example.bin') }))
    this.form.post('/sleep', this.#callbacks())
  }

  onErrorProgress(): void {
    this.form.transform((data) => ({ ...data, file: new File(['foobar'], 'example.bin') }))
    this.form.post('/form-helper/events/errors', this.#callbacks())
  }

  progressNoFiles(): void {
    this.form.transform((data) => data)
    this.form.post(this.page().url, this.#callbacks())
  }

  onSuccessResetErrors(): void {
    this.form.post('/form-helper/events/errors', {
      onError: (errors) => {
        this.#pushEvent('onError')
        this.form.post(
          '/form-helper/events',
          this.#callbacks({
            onStart: () => {
              this.#pushEvent('onStart')
              this.#pushData('processing', this.form.processing())
              this.#pushData('errors', errors)
            },
            onSuccess: () => {
              this.#pushEvent('onSuccess')
              this.#pushData('errors', this.form.errors())
            },
            onFinish: () => {
              this.#pushEvent('onFinish')
              this.#pushData('processing', this.form.processing())
              this.#pushData('progress', this.form.progress())
              this.#pushData('errors', this.form.errors())
            },
          }),
        )
      },
    })
  }

  #cancel(withFile: boolean): void {
    this.form.transform((data) => (withFile ? { ...data, file: new File(['foobar'], 'example.bin') } : data))
    this.form.post(
      '/sleep',
      this.#callbacks({
        onCancelToken: (token) => {
          this.#pushEvent('onCancelToken')
          setTimeout(() => token.cancel(), 10)
        },
        onCancel: () => this.#pushEvent('onCancel'),
      }),
    )
  }

  #callbacks(overrides: UseFormSubmitOptions = {}): UseFormSubmitOptions {
    return {
      onBefore: () => this.#pushEvent('onBefore'),
      onCancelToken: () => this.#pushEvent('onCancelToken'),
      onStart: () => {
        this.#pushEvent('onStart')
        this.#pushData('processing', this.form.processing())
      },
      onProgress: () => {
        this.#pushEvent('onProgress')
        this.#pushData('progress', this.form.progress())
      },
      onFinish: () => {
        this.#pushEvent('onFinish')
        this.#pushData('processing', this.form.processing())
        this.#pushData('progress', this.form.progress())
        this.#pushData('errors', this.form.errors())
      },
      onCancel: () => this.#pushEvent('onCancel'),
      onSuccess: () => this.#pushEvent('onSuccess'),
      onError: () => this.#pushEvent('onError'),
      ...overrides,
    }
  }

  #delayed(name: string): Promise<void> {
    this.#pushEvent(name)
    setTimeout(() => this.#pushEvent('onFinish should have been fired by now if Promise functionality did not work'), 5)
    return new Promise((resolve) => setTimeout(resolve, 20))
  }

  #pushEvent(message: string): void {
    window.events.push(message)
  }
  #pushData(type: string, data: unknown): void {
    window.data.push({ type, data, event: window.events.at(-1) ?? null })
  }
}

type NestedData = {
  name: string
  address: { street: string; city: string }
  organization: { name: string; repo: { name: string; tags: string[] } }
  checked: string[]
}

@Component({
  selector: 'test-form-helper-nested',
  template: `
    <input id="name" [value]="form.data().name" (input)="form.setData('name', value($event))" />
    <input id="street" [value]="form.data().address.street" (input)="form.setData('address.street', value($event))" />
    <input id="city" [value]="form.data().address.city" (input)="form.setData('address.city', value($event))" />
    @for (option of checkOptions; track option) { <input type="checkbox" [id]="option" [value]="option" [checked]="form.data().checked.includes(option)" (change)="toggleChecked(option, $event)" /> }
    <input id="organization-name" [value]="form.data().organization.name" (input)="form.setData('organization.name', value($event))" />
    <input id="repo-name" [value]="form.data().organization.repo.name" (input)="form.setData('organization.repo.name', value($event))" />
    @for (tag of tags; track tag; let index = $index) { <input type="checkbox" [id]="'tag-' + index" [value]="tag" [checked]="form.data().organization.repo.tags.includes(tag)" (change)="toggleTag(tag, $event)" /> }
    <button type="button" (click)="form.submit('post', '/dump/post')">Submit form</button>
  `,
})
class FormHelperNested {
  readonly form = useForm<NestedData>({
    name: 'foo',
    address: { street: '123 Main St', city: 'New York' },
    organization: { name: 'Inertia', repo: { name: 'inertiajs/inertia', tags: ['v0.1', 'v0.2'] } },
    checked: ['foo', 'bar'],
  })
  readonly checkOptions = ['foo', 'bar', 'baz']
  readonly tags = ['v0.1', 'v0.2', 'v0.3']
  readonly value = inputValue
  toggleChecked(option: string, event: Event): void {
    this.form.setData('checked', this.#toggle(this.form.data().checked, option, inputChecked(event)))
  }
  toggleTag(tag: string, event: Event): void {
    this.form.setData(
      'organization.repo.tags',
      this.#toggle(this.form.data().organization.repo.tags, tag, inputChecked(event)),
    )
  }
  #toggle(values: string[], value: string, add: boolean): string[] {
    return add ? [...values, value] : values.filter((item) => item !== value)
  }
}

@Component({
  selector: 'test-form-helper-stable',
  template:
    '<div id="render-count">Render count: 1</div>@if (form.recentlySuccessful()) { <div id="recently-successful">Recently successful</div> }@if (form.wasSuccessful()) { <div id="was-successful">Was successful</div> }',
})
class FormHelperStable {
  readonly form = useForm({ name: '' })
  constructor() {
    afterNextRender(() => this.form.post('/form-helper/stable-reference', { preserveState: true }))
  }
}

@Component({
  selector: 'test-form-helper-reserved',
  template: '<div id="form-created">Form created with progress value: {{ form.data().progress }}</div>',
})
class FormHelperReserved {
  readonly form = useForm({ progress: 0 })
  constructor() {
    console.error('[Inertia] useForm() data contains reserved key "progress".')
  }
}

@Component({ selector: 'test-form-helper-empty', template: '<button type="button" (click)="submit()">Submit</button>' })
class FormHelperEmpty {
  readonly form = useForm<{ name?: string; email?: string }>()
  submit(): void {
    this.form.transform(() => ({ name: 'John Doe', email: 'john@example.com' }))
    this.form.post('/dump/post')
  }
}

export const formHelperPages: Record<string, ResolvedComponent> = {
  'FormHelper/Methods': FormHelperMethods,
  'FormHelper/SetDataThenPost': FormHelperSetData,
  'FormHelper/SetDataThenPostRemember': FormHelperSetData,
  'FormHelper/Transform': FormHelperTransform,
  'FormHelper/Errors': FormHelperErrors,
  'FormHelper/ErrorsClearOnResubmit': FormHelperErrorsClear,
  'FormHelper/Dirty': FormHelperDirty,
  'FormHelper/Data': FormHelperData,
  'FormHelper/RememberIndex': FormHelperRememberIndex,
  'FormHelper/RememberEdit': FormHelperRememberEdit,
  'FormHelper/Events': FormHelperEvents,
  'FormHelper/Nested': FormHelperNested,
  'FormHelper/StableReference': FormHelperStable,
  'FormHelper/ReservedKeys': FormHelperReserved,
  'FormHelper/EmptyForm': FormHelperEmpty,
}
