import { Component, signal } from '@angular/core'
import { Link, router, useForm, useRemember, type ResolvedComponent } from '@inertiajs/angular'

type RememberData = { name: string; remember: boolean }

@Component({
  selector: 'test-remember-default',
  imports: [Link],
  template: `
    <label
      >Full Name <input id="name" name="full_name" [value]="name()" (input)="name.set($any($event.target).value)"
    /></label>
    <label
      >Remember Me
      <input
        id="remember"
        name="remember"
        type="checkbox"
        [checked]="remember()"
        (change)="remember.set($any($event.target).checked)"
    /></label>
    <label
      >Untracked
      <input id="untracked" name="untracked" [value]="untracked()" (input)="untracked.set($any($event.target).value)"
    /></label>
    <a inertiaLink href="/dump/get" class="link">Navigate away</a>
  `,
})
class RememberDefault {
  readonly name = signal('')
  readonly remember = signal(false)
  readonly untracked = signal('')
}

@Component({
  selector: 'test-remember-object',
  imports: [Link],
  template: `
    <label
      >Full Name <input id="name" name="full_name" [value]="data().name" (input)="setName($any($event.target).value)"
    /></label>
    <label
      >Remember Me
      <input
        id="remember"
        name="remember"
        type="checkbox"
        [checked]="data().remember"
        (change)="setRemember($any($event.target).checked)"
    /></label>
    <label
      >Untracked
      <input id="untracked" name="untracked" [value]="untracked()" (input)="untracked.set($any($event.target).value)"
    /></label>
    <a inertiaLink href="/dump/get" class="link">Navigate away</a>
  `,
})
class RememberObject {
  readonly data = useRemember<RememberData>({ name: '', remember: false })
  readonly untracked = signal('')

  setName(name: string): void {
    this.data.update((data) => ({ ...data, name }))
  }

  setRemember(remember: boolean): void {
    this.data.update((data) => ({ ...data, remember }))
  }
}

@Component({
  selector: 'test-remember-component-a',
  template: `
    <span>This component uses a string 'key' for the remember functionality.</span>
    <input class="a-name" name="full_name" [value]="data().name" (input)="setName($any($event.target).value)" />
    <input
      class="a-remember"
      name="remember"
      type="checkbox"
      [checked]="data().remember"
      (change)="setRemember($any($event.target).checked)"
    />
    <input
      class="a-untracked"
      name="untracked"
      [value]="untracked()"
      (input)="untracked.set($any($event.target).value)"
    />
  `,
})
class RememberComponentA {
  readonly data = useRemember<RememberData>({ name: '', remember: false }, 'Example/ComponentA')
  readonly untracked = signal('')

  setName(name: string): void {
    this.data.update((data) => ({ ...data, name }))
  }

  setRemember(remember: boolean): void {
    this.data.update((data) => ({ ...data, remember }))
  }
}

@Component({
  selector: 'test-remember-component-b',
  template: `
    <span>This component uses a dedicated key for the remember functionality.</span>
    <input class="b-name" name="full_name" [value]="data().name" (input)="setName($any($event.target).value)" />
    <input
      class="b-remember"
      name="remember"
      type="checkbox"
      [checked]="data().remember"
      (change)="setRemember($any($event.target).checked)"
    />
    <input
      class="b-untracked"
      name="untracked"
      [value]="untracked()"
      (input)="untracked.set($any($event.target).value)"
    />
  `,
})
class RememberComponentB {
  readonly data = useRemember<RememberData>({ name: '', remember: false }, 'Example/ComponentB')
  readonly untracked = signal('')

  setName(name: string): void {
    this.data.update((data) => ({ ...data, name }))
  }

  setRemember(remember: boolean): void {
    this.data.update((data) => ({ ...data, remember }))
  }
}

@Component({
  selector: 'test-remember-multiple',
  imports: [Link, RememberComponentA, RememberComponentB],
  template: `
    <label
      >Full Name <input id="name" name="full_name" [value]="data().name" (input)="setName($any($event.target).value)"
    /></label>
    <label
      >Remember Me
      <input
        id="remember"
        name="remember"
        type="checkbox"
        [checked]="data().remember"
        (change)="setRemember($any($event.target).checked)"
    /></label>
    <label
      >Untracked
      <input id="untracked" name="untracked" [value]="untracked()" (input)="untracked.set($any($event.target).value)"
    /></label>
    <test-remember-component-a class="component-a" /><test-remember-component-b class="component-b" />
    <a inertiaLink href="/dump/get" class="link">Navigate away</a
    ><a href="/non-inertia" class="off-site">Navigate off-site</a>
  `,
})
class RememberMultiple {
  readonly data = useRemember<RememberData>({ name: '', remember: false })
  readonly untracked = signal('')

  setName(name: string): void {
    this.data.update((data) => ({ ...data, name }))
  }

  setRemember(remember: boolean): void {
    this.data.update((data) => ({ ...data, remember }))
  }
}

type RememberFormData = { name: string; handle: string; remember: boolean }

abstract class RememberFormBase {
  abstract readonly form: ReturnType<typeof useForm<RememberFormData>>
  readonly untracked = signal('')

  setName(name: string): void {
    this.form.setData('name', name)
  }

  setHandle(handle: string): void {
    this.form.setData('handle', handle)
  }

  setRemember(remember: boolean): void {
    this.form.setData('remember', remember)
  }
}

const formTemplate = `
  <label>Full Name <input id="name" name="name" [value]="form.data().name" (input)="setName($any($event.target).value)" /></label>
  @if (form.errors().name) { <span class="name_error">{{ form.errors().name }}</span> }
  <label>Handle <input id="handle" name="handle" [value]="form.data().handle" (input)="setHandle($any($event.target).value)" /></label>
  @if (form.errors().handle) { <span class="handle_error">{{ form.errors().handle }}</span> }
  <label>Remember Me <input id="remember" name="remember" type="checkbox" [checked]="form.data().remember" (change)="setRemember($any($event.target).checked)" /></label>
  @if (form.errors().remember) { <span class="remember_error">{{ form.errors().remember }}</span> }
  <label>Untracked <input id="untracked" name="untracked" [value]="untracked()" (input)="untracked.set($any($event.target).value)" /></label>
  <button type="button" class="submit" (click)="submit()">Submit form</button>
  <a inertiaLink href="/dump/get" class="link">Navigate away</a>
`

@Component({ selector: 'test-remember-form-default', imports: [Link], template: formTemplate })
class RememberFormDefault extends RememberFormBase {
  readonly form = useForm({ name: 'foo', handle: 'example', remember: false })

  submit(): void {
    this.form.post('/remember/form-helper/default')
  }
}

@Component({
  selector: 'test-remember-form',
  imports: [Link],
  template: `${formTemplate}<button type="button" class="reset-one" (click)="resetOne()">
      Reset one field & error
    </button>`,
})
class RememberForm extends RememberFormBase {
  readonly form = useForm('form', { name: 'foo', handle: 'example', remember: false })

  submit(): void {
    this.form.post('/remember/form-helper/remember')
  }

  resetOne(): void {
    this.form.reset('handle')
    this.form.clearErrors('name')
  }
}

@Component({
  selector: 'test-remember-password',
  imports: [Link],
  template: `
    <label
      >Username
      <input id="username" [value]="form.data().username" (input)="form.setData('username', $any($event.target).value)"
    /></label>
    <label
      >Password
      <input
        id="password"
        type="password"
        [value]="form.data().password"
        (input)="form.setData('password', $any($event.target).value)"
    /></label>
    <a inertiaLink href="/dump/get" class="link">Navigate away</a>
  `,
})
class RememberPassword {
  readonly form = useForm('password-form', { username: '', password: '' }).dontRemember('password')
}

@Component({
  selector: 'test-remember-router',
  template: `
    <p>Foo: {{ foo() }}</p>
    <p>Bar: {{ bar() }}</p>
    <button type="button" (click)="remember()">Remember</button>
    <button type="button" (click)="restore()">Restore</button>
    <button type="button" (click)="restore()">Restore Typed</button>
  `,
})
class RememberRouter {
  readonly foo = signal('-')
  readonly bar = signal(0)

  remember(): void {
    router.remember('foo')
    router.remember(42, 'bar')
  }

  restore(): void {
    this.foo.set(router.restore<string>() ?? '-')
    this.bar.set(router.restore<number>('bar') ?? 0)
  }
}

export const rememberPages: Record<string, ResolvedComponent> = {
  'Remember/Default': RememberDefault,
  'Remember/Object': RememberObject,
  'Remember/MultipleComponents': RememberMultiple,
  'Remember/FormHelper/Default': RememberFormDefault,
  'Remember/FormHelper/Remember': RememberForm,
  'Remember/FormHelper/Password': RememberPassword,
  'Remember/Router': RememberRouter,
}
