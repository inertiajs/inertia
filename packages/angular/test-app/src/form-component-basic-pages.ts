import { Component, computed, effect, input, signal } from '@angular/core'
import { Form, config, type ResolvedComponent } from '@inertiajs/angular'
import type { FormComponentOnSubmitCompleteArguments, FormDataConvertible } from '@inertiajs/core'

@Component({
  selector: 'test-form-elements',
  imports: [Form],
  template: `
    <form inertiaForm #form="inertiaForm" action="/dump/post" method="post" [queryStringArrayFormat]="format()">
      <h1>Form Elements</h1>
      <div>
        Form is <span>{{ form.isDirty() ? 'dirty' : 'clean' }}</span>
      </div>
      <input type="text" name="name" id="name" placeholder="Name" />
      <select name="country" id="country">
        <option value="us">United States</option>
        <option value="ca">Canada</option>
        <option value="uk" selected>United Kingdom</option>
      </select>
      <select name="role" id="role">
        <option value="" disabled selected>Role</option>
        <option>User</option>
        <option>Admin</option>
        <option>Super</option>
      </select>
      <label><input type="radio" name="plan" value="free" /> Free</label>
      <label><input type="radio" name="plan" value="pro" /> Pro</label>
      <label><input type="radio" name="plan" value="enterprise" /> Enterprise</label>
      <input type="checkbox" name="subscribe" value="yes" id="subscribe" /><label for="subscribe"
        >Subscribe to newsletter</label
      >
      <label><input type="checkbox" name="interests[]" value="sports" /> Sports</label>
      <label><input type="checkbox" name="interests[]" value="music" /> Music</label>
      <label><input type="checkbox" name="interests[]" value="tech" /> Tech</label>
      <select name="skills[]" id="skills" multiple>
        <option disabled selected>Skills</option>
        <option value="vue">Vue</option>
        <option value="react">React</option>
        <option value="angular">Angular</option>
        <option value="svelte">Svelte</option>
      </select>
      <input type="file" name="avatar" id="avatar" placeholder="Avatar" />
      <input type="file" name="documents[]" id="documents" multiple placeholder="Documents" />
      <textarea name="bio" id="bio" rows="3" placeholder="Bio"></textarea>
      <input type="hidden" name="token" id="token" value="abc123" />
      <input type="number" name="age" id="age" placeholder="Age" />
      <input type="text" name="user[address][street]" id="nested_street" placeholder="Street" />
      <input type="text" name="items[0][name]" value="Item A" id="item_a" />
      <input type="text" name="items[1][name]" value="Item B" id="item_b" />
      <input type="text" name="disabled_field" value="Ignore me" disabled />
      <button type="submit">Submit</button><button type="reset">Reset</button>
    </form>
  `,
})
class ElementsPage {
  readonly queryStringArrayFormat = input<'brackets' | 'indices' | 'force-brackets'>('brackets')
  readonly format = computed<'brackets' | 'indices'>(() => {
    const format = this.queryStringArrayFormat()
    return format === 'force-brackets' ? 'brackets' : format
  })

  constructor() {
    effect(() => {
      if (this.queryStringArrayFormat() === 'force-brackets') {
        config.set('form.forceIndicesArrayFormatInFormData', false)
      }
    })
  }
}

@Component({
  selector: 'test-form-headers',
  imports: [Form],
  template: `
    <form inertiaForm action="/dump/post" method="post" [headers]="headers()">
      <h1>Form Headers</h1>
      <button type="button" (click)="addCustomHeader()">Add Custom Header</button>
      <button type="submit">Submit</button>
    </form>
  `,
})
class HeadersPage {
  readonly headers = signal<Record<string, string>>({ 'X-Foo': 'Bar' })
  addCustomHeader(): void {
    this.headers.update((headers) => ({ ...headers, 'X-Custom': 'MyCustomValue' }))
  }
}

@Component({
  selector: 'test-form-errors',
  imports: [Form],
  template: `
    <form inertiaForm #form="inertiaForm" [action]="action()" method="post" [errorBag]="errorBag()">
      <h1>Form Errors</h1>
      @if (form.hasErrors()) {
        <div>Form has errors</div>
      } @else {
        <div>No errors</div>
      }
      <label for="name">Name</label><input type="text" name="name" id="name" />
      <div id="error_name">{{ form.errors()['name'] }}</div>
      <label for="handle">Handle</label><input type="text" name="handle" id="handle" />
      <div id="error_handle">{{ form.errors()['handle'] }}</div>
      <button type="button" (click)="setErrors(form)">Set Errors</button>
      <button type="button" (click)="form.clearErrors()">Clear Errors</button>
      <button type="button" (click)="form.clearErrors('name')">Clear Name Error</button>
      <button type="button" (click)="errorBag.set('bag')">Use Error Bag</button>
      <button type="submit">Submit</button>
    </form>
  `,
})
class ErrorsPage {
  readonly errorBag = signal<string | null>(null)
  readonly action = computed(() => (this.errorBag() ? '/form-component/errors/bag' : '/form-component/errors'))
  setErrors(form: Form): void {
    form.setError({ name: 'The name field is required.', handle: 'The handle field is invalid.' })
  }
}

@Component({
  selector: 'test-form-default-value',
  imports: [Form],
  template: `
    <form inertiaForm #form="inertiaForm" action="/form-component/default-value" method="patch">
      <h1>Form Default Values</h1>
      <label for="name">Name</label><input type="text" name="name" id="name" [value]="user().name" />
      <div id="error_name">{{ form.errors()['user.name'] }}</div>
      <button type="submit">Submit</button>
    </form>
  `,
})
class DefaultValuePage {
  readonly user = input({ name: '' })
}

const resetTemplate = `
  <label for="name">Name</label><input type="text" name="name" id="name" value="John Doe" />
  <p id="error_name">{{ form.errors()['name'] }}</p>
  <label for="email">Email</label><input type="email" name="email" id="email" value="john@doe.biz" />
  <button type="submit">Submit</button>
`

@Component({
  selector: 'test-form-reset-error',
  imports: [Form],
  template: `<form
    inertiaForm
    #form="inertiaForm"
    method="post"
    action="/form-component/reset-on-error"
    [resetOnError]="true"
  >
    ${resetTemplate}
  </form>`,
})
class ResetOnErrorPage {}
@Component({
  selector: 'test-form-reset-error-fields',
  imports: [Form],
  template: `<form
    inertiaForm
    #form="inertiaForm"
    method="post"
    action="/form-component/reset-on-error-fields"
    [resetOnError]="['name']"
  >
    ${resetTemplate}
  </form>`,
})
class ResetOnErrorFieldsPage {}
@Component({
  selector: 'test-form-reset-success',
  imports: [Form],
  template: `<form
    inertiaForm
    #form="inertiaForm"
    method="post"
    action="/form-component/reset-on-success"
    [resetOnSuccess]="true"
  >
    ${resetTemplate}
  </form>`,
})
class ResetOnSuccessPage {}
@Component({
  selector: 'test-form-reset-success-fields',
  imports: [Form],
  template: `<form
    inertiaForm
    #form="inertiaForm"
    method="post"
    action="/form-component/reset-on-success-fields"
    [resetOnSuccess]="['name']"
  >
    ${resetTemplate}
  </form>`,
})
class ResetOnSuccessFieldsPage {}

@Component({
  selector: 'test-form-defaults-on-success',
  imports: [Form],
  template: `
    <form
      inertiaForm
      #form="inertiaForm"
      method="post"
      action="/form-component/set-defaults-on-success"
      [setDefaultsOnSuccess]="true"
    >
      <p id="dirty-status">{{ form.isDirty() ? 'Form is dirty' : 'Form is clean' }}</p>
      <input type="text" name="name" id="name" value="John Doe" />
      <input type="email" name="email" id="email" value="john@doe.biz" />
      <button type="submit">Submit</button>
    </form>
  `,
})
class SetDefaultsOnSuccessPage {}

@Component({
  selector: 'test-form-disable-processing',
  imports: [Form],
  template: `
    <h1>Form Disable While Processing Test</h1>
    <form inertiaForm method="post" [action]="action()" [disableWhileProcessing]="disable()">
      <input type="text" name="name" placeholder="Name" value="John Doe" />
      <button type="submit">Submit</button>
    </form>
  `,
})
class DisableWhileProcessingPage {
  readonly disable = input(false)
  readonly action = computed(() => `/form-component/disable-while-processing/${this.disable() ? 'yes' : 'no'}/submit`)
}

@Component({
  selector: 'test-form-async-success',
  imports: [Form],
  template: `
    <h1>Form Async OnSuccess Test</h1>
    <form
      inertiaForm
      method="post"
      action="/form-component/async-on-success/submit"
      [disableWhileProcessing]="true"
      [onSuccess]="onSuccess"
    >
      <input type="text" name="name" placeholder="Name" value="John Doe" />
      <button type="submit">Submit</button>
    </form>
  `,
})
class AsyncOnSuccessPage {
  readonly onSuccess = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 1500))
}

@Component({
  selector: 'test-form-empty-action',
  imports: [Form],
  template: `
    <h1>Form Empty Action Test</h1>
    <form inertiaForm #form="inertiaForm" method="post">
      <input type="text" name="name" placeholder="Name" value="John Doe" />
      @if (form.errors()['name']) {
        <p id="error_name">{{ form.errors()['name'] }}</p>
      }
      <button type="submit">Submit</button>
    </form>
  `,
})
class EmptyActionPage {}

@Component({
  selector: 'test-form-submit-complete-reset',
  imports: [Form],
  template: `
    <h1>OnSubmitComplete Reset Test</h1>
    <form inertiaForm #form="inertiaForm" method="post" (submitComplete)="resetName($event)">
      <input type="text" name="name" id="name" value="John Doe" />
      <input type="email" name="email" id="email" value="john@doe.biz" />
      <button type="submit">Submit</button>
    </form>
  `,
})
class SubmitCompleteResetPage {
  resetName(event: FormComponentOnSubmitCompleteArguments<Record<string, FormDataConvertible>>): void {
    event.reset('name')
  }
}

@Component({
  selector: 'test-form-submit-complete-defaults',
  imports: [Form],
  template: `
    <h1>OnSubmitComplete Defaults Test</h1>
    <form inertiaForm #form="inertiaForm" method="post" (submitComplete)="$event.defaults()">
      <p id="dirty-status">{{ form.isDirty() ? 'Form is dirty' : 'Form is clean' }}</p>
      <input type="text" name="name" id="name" value="John Doe" />
      <input type="email" name="email" id="email" value="john@doe.biz" />
      <button type="submit">Submit</button>
    </form>
  `,
})
class SubmitCompleteDefaultsPage {}

@Component({
  selector: 'test-form-submit-complete-redirect',
  imports: [Form],
  template: `
    <h1>Form Redirect Test</h1>
    <form
      inertiaForm
      method="post"
      action="/form-component/submit-complete/redirect"
      (submitComplete)="$event.reset('name')"
    >
      <input type="text" name="name" id="name" value="John Doe" />
      <button type="submit">Submit</button>
    </form>
  `,
})
class SubmitCompleteRedirectPage {}

@Component({
  selector: 'test-form-unmount-race',
  imports: [Form],
  template: `
    <h1>Form Unmount Race</h1>
    @if (show()) {
      <form inertiaForm action="/dump/post" method="post"><input name="name" id="name" value="John" /></form>
    }
    <button id="hide" type="button" (click)="show.set(false)">Hide Form</button>
  `,
})
class UnmountRacePage {
  readonly show = signal(true)
}

export const formComponentBasicPages: Record<string, ResolvedComponent> = {
  'FormComponent/Elements': ElementsPage,
  'FormComponent/Headers': HeadersPage,
  'FormComponent/Errors': ErrorsPage,
  'FormComponent/DefaultValue': DefaultValuePage,
  'FormComponent/ResetAttributes/ResetOnError': ResetOnErrorPage,
  'FormComponent/ResetAttributes/ResetOnErrorFields': ResetOnErrorFieldsPage,
  'FormComponent/ResetAttributes/ResetOnSuccess': ResetOnSuccessPage,
  'FormComponent/ResetAttributes/ResetOnSuccessFields': ResetOnSuccessFieldsPage,
  'FormComponent/SetDefaultsOnSuccess': SetDefaultsOnSuccessPage,
  'FormComponent/DisableWhileProcessing': DisableWhileProcessingPage,
  'FormComponent/AsyncOnSuccess': AsyncOnSuccessPage,
  'FormComponent/EmptyAction': EmptyActionPage,
  'FormComponent/SubmitComplete/Reset': SubmitCompleteResetPage,
  'FormComponent/SubmitComplete/Defaults': SubmitCompleteDefaultsPage,
  'FormComponent/SubmitComplete/Redirect': SubmitCompleteRedirectPage,
  'FormComponent/UnmountRace': UnmountRacePage,
}
