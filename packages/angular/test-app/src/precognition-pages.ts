import { Component, computed, signal } from '@angular/core'
import {
  Form as InertiaFormDirective,
  config,
  useForm,
  usePage,
  type InertiaFormComponent as FormDirectiveApi,
  type InertiaPrecognitiveFormProps,
  type ResolvedComponent,
} from '@inertiajs/angular'
import type { FormDataConvertible, FormDataKeys, Method, UrlMethodPair } from '@inertiajs/core'
import type { NamedInputEvent } from 'laravel-precognition'

const value = (event: Event): string => (event.target as HTMLInputElement).value
const file = (event: Event): File | null => (event.target as HTMLInputElement).files?.[0] ?? null

type PrecognitionData = {
  name: string
  email: string
  company: string
  avatar: File | null
  items: Array<{ name: string }>
  document: { customer: { email: string } }
}

const initialData = (): PrecognitionData => ({
  name: '',
  email: '',
  company: '',
  avatar: null,
  items: [],
  document: { customer: { email: '' } },
})

const allErrors = (error: string | string[] | undefined): string[] =>
  error === undefined ? [] : Array.isArray(error) ? error : [error]

@Component({
  selector: 'test-precognition-helper',
  template: `
    @if (is('DynamicArrayInputs')) {
      <button id="add-item" type="button" (click)="addItem()">Add Item</button>
      @for (item of form.data().items; track $index; let index = $index) {
        <input [name]="'items.' + index + '.name'" [value]="item.name" (input)="updateItem(index, $event)" (blur)="validateItem(index)" />
        @if (itemInvalid(index)) { <p [id]="'items.' + index + '.name-error'">{{ itemError(index) }}</p> }
      }
    } @else if (is('TransformKeys')) {
      <input id="email-input" name="customer.email" [value]="form.data().document.customer.email" (input)="form.setData('document.customer.email', inputValue($event))" (blur)="form.validate(transformKey)" />
      @if (form.invalid(transformKey)) { <p>{{ form.errors()[transformKey] }}</p> }
      @if (form.valid(transformKey)) { <p>Email is valid!</p> }
    } @else {
      <input name="name" placeholder="Name" [id]="is('Cancel') ? 'auto-cancel-name-input' : null" [value]="form.data().name" (input)="form.setData('name', inputValue($event))" (blur)="handleBlur('name')" />
      @if (isAllErrors()) {
        @for (error of errorsFor('name'); track $index; let index = $index) { <p [id]="'name-error-' + index">{{ error }}</p> }
      } @else if (form.invalid('name')) { <p [id]="is('ErrorSync') ? 'name-error' : null">{{ form.errors().name }}</p> }
      @if (form.valid('name')) { <p>Name is valid!</p> }

      @if (!is('Cancel') && !is('Files') && !is('Headers')) {
        <input name="email" placeholder="Email" [value]="form.data().email" (input)="form.setData('email', inputValue($event))" (blur)="handleBlur('email')" />
        @if (isAllErrors()) {
          @for (error of errorsFor('email'); track $index; let index = $index) { <p [id]="'email-error-' + index">{{ error }}</p> }
        } @else if (form.invalid('email')) { <p [id]="is('ErrorSync') ? 'email-error' : null">{{ form.errors().email }}</p> }
        @if (form.valid('email')) { <p>Email is valid!</p> }
      }

      @if (is('Files')) {
        <input id="avatar" name="avatar" type="file" (change)="form.setData('avatar', inputFile($event))" />
        @if (form.invalid('avatar')) { <p>{{ form.errors().avatar }}</p> }
        @if (form.valid('avatar')) { <p>Avatar is valid!</p> }
        <button type="button" (click)="toggleFiles()">Toggle Validate Files ({{ validateFiles() ? 'enabled' : 'disabled' }})</button>
        <button type="button" (click)="form.validate(filesConfig)">Validate Both</button>
      }

      @if (is('Methods')) {
        <p id="name-touched">{{ form.touched('name') ? 'Name is touched' : 'Name is not touched' }}</p>
        <p id="email-touched">{{ form.touched('email') ? 'Email is touched' : 'Email is not touched' }}</p>
        <p id="any-touched">{{ form.touched() ? 'Form has touched fields' : 'Form has no touched fields' }}</p>
        <button type="button" (click)="form.validate()">Validate All Touched</button>
        <button type="button" (click)="form.validate('name')">Validate Name</button>
        <button type="button" (click)="form.validate(fieldsConfig)">Validate Name and Email</button>
        <button type="button" (click)="form.touch(['name', 'email'])">Touch Name and Email</button>
        <button type="button" (click)="touchNameTwice()">Touch Name Twice</button>
        <button type="button" (click)="form.reset()">Reset All</button>
        <button type="button" (click)="form.reset('name')">Reset Name</button>
        <button type="button" (click)="form.reset('name', 'email')">Reset Name and Email</button>
      }

      @if (is('Callbacks')) {
        @if (successCalled()) { <p>onPrecognitionSuccess called!</p> }
        @if (errorCalled()) { <p>onValidationError called!</p> }
        @if (finishCalled()) { <p>onFinish called!</p> }
        <button type="button" (click)="validateCallbacks()">Validate</button>
      }

      @if (is('ErrorSync')) { <button id="submit-btn" type="button" (click)="form.submit()">Submit</button> }
    }
    @if (form.validating()) { <p [id]="is('ErrorSync') ? 'validating' : null">Validating...</p> }
  `,
})
class PrecognitionHelperPage {
  readonly page = usePage()
  readonly mode = computed(() => this.page().component.split('/').at(-1) ?? 'Default')
  readonly endpoint = computed<UrlMethodPair>(() => ({ method: 'post', url: this.#endpointUrl() }))
  readonly form = useForm(initialData)
    .withPrecognition(() => this.endpoint())
    .setValidationTimeout(100)
  readonly validateFiles = signal(false)
  readonly successCalled = signal(false)
  readonly errorCalled = signal(false)
  readonly finishCalled = signal(false)
  readonly inputValue = value
  readonly inputFile = file
  readonly fieldsConfig: { only: FormDataKeys<PrecognitionData>[] } = { only: ['name', 'email'] }
  readonly filesConfig: { only: FormDataKeys<PrecognitionData>[] } = { only: ['name', 'avatar'] }
  readonly transformKey = 'customer.email' as FormDataKeys<PrecognitionData>

  constructor() {
    if (this.is('WithAllErrors')) this.form.withAllErrors()
    if (this.is('WithAllErrorsConfig')) config.set('form.withAllErrors', true)
    if (this.is('Transform')) this.form.transform((data) => ({ name: data.name.repeat(2) }))
    if (this.is('TransformKeys')) this.form.transform((data) => ({ ...data.document }))
  }

  is(mode: string): boolean {
    return this.mode() === mode
  }
  isAllErrors(): boolean {
    return this.is('WithAllErrors') || this.is('WithAllErrorsConfig')
  }
  errorsFor(field: 'name' | 'email'): string[] {
    return allErrors(this.form.errors()[field])
  }

  handleBlur(field: 'name' | 'email'): void {
    if (this.is('Methods') || this.is('Callbacks') || this.is('Files')) {
      this.form.touch(field)
      return
    }
    if (this.is('BeforeValidation') && field === 'name') {
      this.form.validate(field, {
        onBeforeValidation: (next, previous) => {
          const expectedNext = JSON.stringify({ data: { name: 'block' }, touched: ['name'] })
          const expectedPrevious = JSON.stringify({ data: {}, touched: [] })
          return !(JSON.stringify(next) === expectedNext && JSON.stringify(previous) === expectedPrevious)
        },
      })
      return
    }
    if (this.is('Headers')) {
      this.form.validate(field, { headers: { 'X-Custom-Header': 'custom-value' } })
      return
    }
    this.form.validate(field)
  }

  toggleFiles(): void {
    this.validateFiles.update((enabled) => !enabled)
    if (this.validateFiles()) this.form.validateFiles()
    else this.form.withoutFileValidation()
  }

  validateCallbacks(): void {
    this.successCalled.set(false)
    this.errorCalled.set(false)
    this.finishCalled.set(false)
    this.form.validate({
      onPrecognitionSuccess: () => this.successCalled.set(true),
      onValidationError: () => this.errorCalled.set(true),
      onFinish: () => this.finishCalled.set(true),
    })
  }

  touchNameTwice(): void {
    this.form.touch('name')
    this.form.touch('name')
  }
  addItem(): void {
    this.form.setData('items', [...this.form.data().items, { name: '' }])
  }
  updateItem(index: number, event: Event): void {
    const items = [...this.form.data().items]
    items[index] = { name: value(event) }
    this.form.setData('items', items)
  }
  itemKey(index: number): FormDataKeys<PrecognitionData> {
    return `items.${index}.name` as FormDataKeys<PrecognitionData>
  }
  validateItem(index: number): void {
    this.form.validate(this.itemKey(index))
  }
  itemInvalid(index: number): boolean {
    return this.form.invalid(this.itemKey(index))
  }
  itemError(index: number): string | string[] | undefined {
    return this.form.errors()[this.itemKey(index)]
  }

  #endpointUrl(): string {
    if (this.is('Files')) return '/precognition/files'
    if (this.is('WithAllErrors') || this.is('WithAllErrorsConfig') || this.is('WithoutAllErrors'))
      return '/precognition/with-all-errors'
    if (this.is('Headers')) return '/precognition/headers'
    if (this.is('Cancel')) return '/precognition/default?slow=1'
    if (this.is('DynamicArrayInputs')) return '/precognition/dynamic-array-inputs'
    if (this.is('ErrorSync')) return '/precognition/error-sync'
    if (this.is('TransformKeys')) return '/precognition/transform-keys'
    return '/precognition/default'
  }
}

@Component({
  selector: 'test-precognition-form',
  imports: [InertiaFormDirective],
  template: `
    @if (is('DynamicArrayInputs')) { <button id="add-item" type="button" (click)="items.update(current => [...current, ''])">Add Item</button> }
    <form inertiaForm #form="inertiaForm" [action]="endpoint()" method="post" [validationTimeout]="100" [validateFiles]="validateFiles()" [withAllErrors]="is('WithAllErrors') ? true : null" [headers]="headers()" [transform]="transform">
      @if (is('DynamicArrayInputs')) {
        @for (item of items(); track $index; let index = $index) {
          <input [name]="'items.' + index + '.name'" [value]="item" (input)="updateItem(index, $event)" (blur)="validateItem(form, index)" />
          @if (form.invalid(itemKey(index))) { <p [id]="'items.' + index + '.name-error'">{{ form.errors()[itemKey(index)] }}</p> }
        }
      } @else if (is('TransformKeys')) {
        <input id="email-input" name="document[customer][email]" (blur)="form.validate(transformKey)" />
        @if (form.invalid(transformKey)) { <p>{{ form.errors()[transformKey] }}</p> }
        @if (form.valid(transformKey)) { <p>Email is valid!</p> }
      } @else {
        <input name="name" placeholder="Name" [id]="is('Cancel') ? 'auto-cancel-name-input' : null" (blur)="handleBlur(form, 'name')" />
        @if (isAllErrors()) {
          @for (error of formErrors(form, 'name'); track $index; let index = $index) { <p [id]="'name-error-' + index">{{ error }}</p> }
        } @else if (form.invalid('name')) { <p [id]="is('ErrorSync') ? 'name-error' : null">{{ form.errors()['name'] }}</p> }
        @if (form.valid('name')) { <p>Name is valid!</p> }

        @if (!is('Cancel') && !is('Files') && !is('Headers')) {
          <input name="email" placeholder="Email" (blur)="handleBlur(form, 'email')" />
          @if (isAllErrors()) {
            @for (error of formErrors(form, 'email'); track $index; let index = $index) { <p [id]="'email-error-' + index">{{ error }}</p> }
          } @else if (form.invalid('email')) { <p [id]="is('ErrorSync') ? 'email-error' : null">{{ form.errors()['email'] }}</p> }
          @if (form.valid('email')) { <p>Email is valid!</p> }
        }

        @if (is('Files')) {
          <input id="avatar" name="avatar" type="file" />
          @if (form.invalid('avatar')) { <p>{{ form.errors()['avatar'] }}</p> }
          @if (form.valid('avatar')) { <p>Avatar is valid!</p> }
          <button type="button" (click)="validateFiles.update(enabled => !enabled)">Toggle Validate Files ({{ validateFiles() ? 'enabled' : 'disabled' }})</button>
          <button type="button" (click)="form.validate(filesConfig)">Validate Both</button>
        }

        @if (is('Methods')) {
          <p id="name-touched">{{ form.touched('name') ? 'Name is touched' : 'Name is not touched' }}</p>
          <p id="email-touched">{{ form.touched('email') ? 'Email is touched' : 'Email is not touched' }}</p>
          <p id="any-touched">{{ form.touched() ? 'Form has touched fields' : 'Form has no touched fields' }}</p>
          <button type="button" (click)="form.validate()">Validate All Touched</button>
          <button type="button" (click)="form.validate('name')">Validate Name</button>
          <button type="button" (click)="form.validate(fieldsConfig)">Validate Name and Email</button>
          <button type="button" (click)="form.touch('name', 'email')">Touch Name and Email</button>
          <button type="button" (click)="form.touch('name'); form.touch('name')">Touch Name Twice</button>
          <button type="button" (click)="form.reset()">Reset All</button>
          <button type="button" (click)="form.reset('name')">Reset Name</button>
          <button type="button" (click)="form.reset('name', 'email')">Reset Name and Email</button>
        }

        @if (is('Callbacks')) {
          @if (successCalled()) { <p>onPrecognitionSuccess called!</p> }
          @if (errorCalled()) { <p>onValidationError called!</p> }
          @if (finishCalled()) { <p>onFinish called!</p> }
          <button type="button" (click)="validateCallbacks(form)">Validate</button>
        }
        @if (is('ErrorSync')) { <button id="submit-btn" type="submit">Submit</button> }
      }
      @if (form.validating()) { <p [id]="is('ErrorSync') ? 'validating' : null">Validating...</p> }
    </form>
  `,
})
class PrecognitionFormPage {
  readonly page = usePage()
  readonly mode = computed(() => this.page().component.split('/').at(-1) ?? 'Default')
  readonly endpoint = computed(() => this.#endpointUrl())
  readonly items = signal<string[]>([])
  readonly validateFiles = signal(false)
  readonly successCalled = signal(false)
  readonly errorCalled = signal(false)
  readonly finishCalled = signal(false)
  readonly fieldsConfig = { only: ['name', 'email'] }
  readonly filesConfig = { only: ['name', 'avatar'] }
  readonly transformKey = 'customer.email'
  readonly headers = computed<Record<string, string>>(() => {
    if (this.is('Headers')) return { 'X-Custom-Header': 'custom-value' }

    return {} as Record<string, string>
  })
  readonly transform = (data: Record<string, FormDataConvertible>): Record<string, FormDataConvertible> => {
    if (this.is('Transform')) return { name: String(data['name'] ?? '').repeat(2) }
    if (this.is('TransformKeys')) return (data['document'] as Record<string, FormDataConvertible> | undefined) ?? {}
    return data
  }

  constructor() {
    if (this.is('WithAllErrorsConfig')) config.set('form.withAllErrors', true)
  }

  is(mode: string): boolean {
    return this.mode() === mode
  }
  isAllErrors(): boolean {
    return this.is('WithAllErrors') || this.is('WithAllErrorsConfig')
  }
  formErrors(form: FormDirectiveApi<Record<string, FormDataConvertible>>, field: string): string[] {
    return allErrors(form.errors()[field])
  }

  handleBlur(form: FormDirectiveApi<Record<string, FormDataConvertible>>, field: string): void {
    if (this.is('Methods') || this.is('Callbacks') || this.is('Files')) {
      form.touch(field)
      return
    }
    if (this.is('BeforeValidation') && field === 'name') {
      form.validate(field, {
        onBeforeValidation: (next: { data: Record<string, unknown> | null }) =>
          next.data?.['name'] === 'block' ? false : true,
      })
      return
    }
    form.validate(field)
  }

  validateCallbacks(form: FormDirectiveApi<Record<string, FormDataConvertible>>): void {
    this.successCalled.set(false)
    this.errorCalled.set(false)
    this.finishCalled.set(false)
    form.validate({
      onPrecognitionSuccess: () => this.successCalled.set(true),
      onValidationError: () => this.errorCalled.set(true),
      onFinish: () => this.finishCalled.set(true),
    })
  }

  itemKey(index: number): string {
    return `items.${index}.name`
  }
  updateItem(index: number, event: Event): void {
    this.items.update((items) => items.map((item, itemIndex) => (itemIndex === index ? value(event) : item)))
  }
  validateItem(form: FormDirectiveApi<Record<string, FormDataConvertible>>, index: number): void {
    form.validate(this.itemKey(index))
  }

  #endpointUrl(): string {
    if (this.is('Files')) return '/precognition/files'
    if (this.is('WithAllErrors') || this.is('WithAllErrorsConfig') || this.is('WithoutAllErrors'))
      return '/precognition/with-all-errors'
    if (this.is('Headers')) return '/precognition/headers'
    if (this.is('Cancel')) return '/precognition/default?slow=1'
    if (this.is('DynamicArrayInputs')) return '/precognition/dynamic-array-inputs'
    if (this.is('ErrorSync')) return '/precognition/error-sync'
    if (this.is('TransformKeys')) return '/precognition/transform-keys'
    return '/precognition/default'
  }
}

type InstantiateData = { name: string }

@Component({
  selector: 'test-precognition-instantiate',
  template: `
    <select [value]="selected()" (change)="selected.set(inputValue($event))">
      @for (key of keys; track key) { <option [value]="key">{{ key }}</option> }
    </select>
    <button type="button" (click)="current().touch('name').validate()">Validate</button>
    <button type="button" (click)="current().submit()">Submit without args</button>
    <button type="button" (click)="current().submit('patch', '/dump/patch')">Submit with args</button>
    <button type="button" (click)="current().put('/dump/put')">Submit with method</button>
    <button type="button" (click)="current().submit(wayfinderSubmit)">Submit with Wayfinder</button>
    @if (current().validating()) { <p>Validating...</p> }
    @if (current().errors().name; as error) { <p>{{ error }}</p> }
  `,
})
class PrecognitionInstantiate {
  readonly wayfinder = (): UrlMethodPair => ({ url: '/precognition/default', method: 'post' })
  readonly forms: Record<string, InertiaPrecognitiveFormProps<InstantiateData>> = {
    default: useForm({ name: 'a' }).withPrecognition('post', '/precognition/default'),
    dynamic: useForm({ name: 'a' }).withPrecognition(
      () => 'post',
      () => '/precognition/default',
    ),
    wayfinder: useForm({ name: 'a' }).withPrecognition(this.wayfinder()),
    dynamicWayfinder: useForm({ name: 'a' }).withPrecognition(() => this.wayfinder()),
    legacy: useForm('post', '/precognition/default', { name: 'a' }),
    legacyDynamic: useForm(
      () => 'post' as Method,
      () => '/precognition/default',
      { name: 'a' },
    ),
    legacyWayfinder: useForm(this.wayfinder(), { name: 'a' }),
    legacyDynamicWayfinder: useForm(() => this.wayfinder(), { name: 'a' }),
  }
  readonly keys = Object.keys(this.forms)
  readonly selected = signal('default')
  readonly wayfinderSubmit = { method: 'post' as const, url: '/dump/post' }
  readonly inputValue = value
  current(): InertiaPrecognitiveFormProps<InstantiateData> {
    return this.forms[this.selected()]
  }
}

@Component({
  selector: 'test-precognition-compatibility',
  template: `
    <input name="company" (focus)="focusCompany($event)" />
    @if (form.errors().name; as error) { <p id="name-error">{{ error }}</p> }
    @if (form.errors().email; as error) { <p id="email-error">{{ error }}</p> }
    @if (form.errors().company; as error) { <p id="company-error">{{ error }}</p> }
    <button id="test-setErrors" type="button" (click)="form.setErrors(errors)">Test setErrors()</button>
    <button id="test-forgetError" type="button" (click)="form.forgetError('name')">Test forgetError()</button>
    <button id="test-touch-array" type="button" (click)="form.touch(['name', 'email'])">Test touch([])</button>
    <button id="test-touch-spread" type="button" (click)="form.touch('name', 'email')">Test touch(...args)</button>
    <p id="touched-name">Name touched: {{ form.touched('name') ? 'yes' : 'no' }}</p>
    <p id="touched-email">Email touched: {{ form.touched('email') ? 'yes' : 'no' }}</p>
    <p id="touched-company">Company touched: {{ form.touched('company') ? 'yes' : 'no' }}</p>
    <p id="touched-any">Any touched: {{ form.touched() ? 'yes' : 'no' }}</p>
  `,
})
class PrecognitionCompatibility {
  readonly form = useForm({ name: '', email: '', company: '' })
    .withPrecognition('post', '/precognition/default')
    .setValidationTimeout(100)
  readonly errors = { name: 'setErrors test', email: 'setErrors email test', company: 'setErrors company test' }
  focusCompany(event: Event): void {
    this.form.forgetError(event as NamedInputEvent)
    this.form.touch(event as NamedInputEvent)
  }
}

const modes = [
  'Default',
  'WithoutAllErrors',
  'WithAllErrors',
  'WithAllErrorsConfig',
  'Methods',
  'Files',
  'Transform',
  'TransformKeys',
  'Callbacks',
  'BeforeValidation',
  'Headers',
  'Cancel',
  'DynamicArrayInputs',
  'ErrorSync',
]

export const precognitionPages: Record<string, ResolvedComponent> = {
  ...Object.fromEntries(modes.map((mode) => [`FormHelper/Precognition/${mode}`, PrecognitionHelperPage])),
  ...Object.fromEntries(modes.map((mode) => [`FormComponent/Precognition/${mode}`, PrecognitionFormPage])),
  'FormHelper/Precognition/Instantiate': PrecognitionInstantiate,
  'FormHelper/Precognition/Compatibility': PrecognitionCompatibility,
}
