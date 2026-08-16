import { ApplicationRef, Component, inject, input, signal } from '@angular/core'
import { Form, useFormContext, type InertiaFormComponent, type ResolvedComponent } from '@inertiajs/angular'
import type { FormDataConvertible } from '@inertiajs/core'

type ContextForm = InertiaFormComponent<Record<string, FormDataConvertible>>

@Component({
  selector: 'test-form-context-deep',
  template: `
    @if (form) {
      <span>Deeply Nested: Form is {{ form.isDirty() ? 'dirty' : 'clean' }}</span>
    } @else {
      <span>No context</span>
    }
  `,
})
class DeeplyNestedComponent {
  readonly form = useFormContext()
}

@Component({
  selector: 'test-form-context-nested',
  imports: [DeeplyNestedComponent],
  template: '<test-form-context-deep />',
})
class NestedComponent {}

@Component({
  selector: 'test-form-context-child',
  template: `
    @if (form) {
      <div>
        <span>Child: Form is {{ form.isDirty() ? 'dirty' : 'clean' }}</span>
        @if (form.hasErrors()) {
          <span> | Child: Form has errors</span>
        }
        @if (form.processing()) {
          <span> | Child: Form is processing</span>
        }
        @if (form.wasSuccessful()) {
          <span> | Child: Form was successful</span>
        }
        @if (form.recentlySuccessful()) {
          <span> | Child: Form recently successful</span>
        }
        @if (form.errors()['name']) {
          <span> | Error: {{ form.errors()['name'] }}</span>
        }
      </div>
    } @else {
      <div>No form context available</div>
    }

    <button type="button" (click)="setError()">Set Error</button>
    <button type="button" (click)="clearError()">Clear Error</button>
    @if (!formId()) {
      <button type="button" (click)="form?.submit()">Submit from Child</button>
      <button type="button" (click)="form?.reset()">Reset from Child</button>
      <button type="button" (click)="form?.defaults()">Set Defaults</button>
    }
  `,
})
class ChildComponent {
  readonly formId = input('')
  readonly form = useFormContext() as ContextForm | null
  readonly #appRef = inject(ApplicationRef)

  setError(): void {
    this.form?.setError('name', this.formId() ? 'Error from child' : 'Error set from child component')
  }

  clearError(): void {
    this.form?.clearErrors('name')
    this.#appRef.tick()
  }
}

@Component({
  selector: 'test-form-context-outside',
  template: `
    @if (form === null) {
      <div>Correctly returns undefined when used outside a Form component</div>
    } @else {
      <div>Unexpectedly has form context</div>
    }
  `,
})
class OutsideFormComponent {
  readonly form = useFormContext()
}

@Component({
  selector: 'test-form-context-default',
  imports: [Form, ChildComponent, NestedComponent, OutsideFormComponent],
  template: `
    <form inertiaForm #form="inertiaForm" action="/dump/post" method="post">
      <div>
        <span>Parent: Form is {{ form.isDirty() ? 'dirty' : 'clean' }}</span>
        @if (form.hasErrors()) {
          <span> | Parent: Form has errors</span>
        }
        @if (form.errors()['name']) {
          <span> | {{ form.errors()['name'] }}</span>
        }
      </div>

      <input type="text" name="name" value="John Doe" />
      <input type="email" name="email" value="john@example.com" />
      <test-form-context-child />
      <test-form-context-nested />
    </form>

    <test-form-context-outside />
  `,
})
class ContextDefault {}

@Component({
  selector: 'test-form-context-methods-child',
  template: `
    @if (form) {
      @if (form.processing()) {
        <span>Child: processing</span>
      }
      @if (form.wasSuccessful()) {
        <span>Child: was successful</span>
      }
      @if (form.recentlySuccessful()) {
        <span>Child: recently successful</span>
      }
      @if (form.hasErrors()) {
        <pre>{{ stringify(form.errors()) }}</pre>
      }

      <button type="button" (click)="form.submit()">submit()</button>
      <button type="button" (click)="form.reset()">reset()</button>
      <button type="button" (click)="form.reset('name')">reset('name')</button>
      <button type="button" (click)="form.reset('name', 'email')">reset('name', 'email')</button>
      <button type="button" (click)="clearErrors()">clearErrors()</button>
      <button type="button" (click)="clearErrors('name')">clearErrors('name')</button>
      <button type="button" (click)="form.setError('name', 'Name is invalid')">setError('name')</button>
      <button type="button" (click)="setErrors()">setError({{ '{' }}...{{ '}' }})</button>
      <button type="button" (click)="resetAndClearErrors()">resetAndClearErrors()</button>
      <button type="button" (click)="resetAndClearErrors('name')">resetAndClearErrors('name')</button>
      <button type="button" (click)="testGetData()">getData()</button>
      <button type="button" (click)="testGetFormData()">getFormData()</button>

      @if (getDataResult()) {
        <pre id="get-data-result">{{ getDataResult() }}</pre>
      }
      @if (getFormDataResult()) {
        <pre id="get-form-data-result">{{ getFormDataResult() }}</pre>
      }
    } @else {
      <div>No form context available</div>
    }
  `,
})
class MethodsTestComponent {
  readonly form = useFormContext() as ContextForm | null
  readonly getDataResult = signal('')
  readonly getFormDataResult = signal('')
  readonly stringify = (value: unknown): string => JSON.stringify(value, null, 2)
  readonly #appRef = inject(ApplicationRef)

  setErrors(): void {
    this.form?.setError({
      name: 'Name error from child',
      email: 'Email error from child',
      bio: 'Bio error from child',
    })
  }

  clearErrors(...fields: string[]): void {
    this.form?.clearErrors(...fields)
    this.#appRef.tick()
  }

  resetAndClearErrors(...fields: string[]): void {
    this.form?.resetAndClearErrors(...fields)
    this.#appRef.tick()
  }

  testGetData(): void {
    if (this.form) this.getDataResult.set(this.stringify(this.form.getData()))
  }

  testGetFormData(): void {
    if (!this.form) return

    const data: Record<string, FormDataEntryValue> = {}
    this.form.getFormData().forEach((value, key) => (data[key] = value))
    this.getFormDataResult.set(this.stringify(data))
  }
}

@Component({
  selector: 'test-form-context-methods',
  imports: [Form, MethodsTestComponent],
  template: `
    <form inertiaForm #form="inertiaForm" action="/form-component/context/methods" method="post">
      @if (form.hasErrors()) {
        <pre>{{ stringify(form.errors()) }}</pre>
      }
      <input type="text" name="name" value="Initial Name" />
      <input type="email" name="email" value="initial@example.com" />
      <textarea name="bio">Initial bio</textarea>
      <test-form-context-methods-child />
    </form>
  `,
})
class ContextMethods {
  readonly stringify = (value: unknown): string => JSON.stringify(value, null, 2)
}

@Component({
  selector: 'test-form-context-multiple',
  imports: [Form, ChildComponent],
  template: `
    <form inertiaForm #first="inertiaForm" action="/dump/post" method="post">
      <div>
        <span>Form 1 Parent: {{ first.isDirty() ? 'dirty' : 'clean' }}</span>
        @if (first.errors()['name']) {
          <span> | Error: {{ first.errors()['name'] }}</span>
        }
      </div>
      <input type="text" name="name" value="Form 1 Name" />
      <test-form-context-child formId="form1" />
    </form>

    <form inertiaForm #second="inertiaForm" action="/dump/post" method="post">
      <div>
        <span>Form 2 Parent: {{ second.isDirty() ? 'dirty' : 'clean' }}</span>
        @if (second.errors()['name']) {
          <span> | Error: {{ second.errors()['name'] }}</span>
        }
      </div>
      <input type="text" name="name" value="Form 2 Name" />
      <test-form-context-child formId="form2" />
    </form>
  `,
})
class ContextMultiple {}

export const formComponentContextPages: Record<string, ResolvedComponent> = {
  'FormComponent/Context/Default': ContextDefault,
  'FormComponent/Context/Methods': ContextMethods,
  'FormComponent/Context/Multiple': ContextMultiple,
}
