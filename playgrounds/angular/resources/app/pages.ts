import { Component, input } from '@angular/core'
import {
  Deferred,
  DeferredContent,
  DeferredFallback,
  Form,
  Head,
  InfiniteScroll,
  LayoutOutlet,
  Link,
  useForm,
  usePoll,
  useRemember,
  type ResolvedComponent,
} from '@inertiajs/angular'

@Component({
  selector: 'playground-layout',
  imports: [LayoutOutlet, Link],
  template: `
    <header class="border-b border-slate-200 bg-white">
      <nav class="mx-auto flex max-w-5xl flex-wrap gap-4 p-4">
        <a inertiaLink href="/">Home</a><a inertiaLink href="/users">Users</a> <a inertiaLink href="/form">Form</a
        ><a inertiaLink href="/precognition">Precognition</a> <a inertiaLink href="/defer">Deferred</a
        ><a inertiaLink href="/poll">Polling</a> <a inertiaLink href="/optimistic">Optimistic</a
        ><a inertiaLink href="/infinite-scroll">Infinite scroll</a>
      </nav>
    </header>
    <main class="mx-auto max-w-5xl p-6"><inertia-layout-outlet /></main>
  `,
})
export class PlaygroundLayout {}

@Component({
  selector: 'playground-home',
  imports: [Head],
  template: `
    <ng-template inertiaHead title="Home" />
    <h1 class="text-3xl font-semibold">Inertia + Angular</h1>
    <p class="mt-3 text-slate-600">Standalone, zoneless, server rendered, and navigated by Inertia.</p>
  `,
})
class Home {}

type User = { id: number; name: string; email: string }

@Component({
  selector: 'playground-users',
  imports: [Head],
  template: `
    <ng-template inertiaHead title="Users" />
    <h1 class="text-2xl font-semibold">Users</h1>
    <label
      >Remembered filter <input class="border" [value]="filter()" (input)="filter.set($any($event.target).value)"
    /></label>
    <ul class="mt-4 space-y-2">
      @for (user of users(); track user.id) {
        <li>{{ user.name }} — {{ user.email }}</li>
      }
    </ul>
  `,
})
class Users {
  readonly users = input<User[]>([])
  readonly filter = useRemember('', 'angular-playground-users-filter')
}

@Component({
  selector: 'playground-form',
  imports: [Head],
  template: `
    <ng-template inertiaHead title="Form" />
    <h1 class="text-2xl font-semibold">Signal form helper</h1>
    <form class="mt-4 space-y-3" (submit)="submit($event)">
      <input
        class="block border p-2"
        name="name"
        [value]="form.data().name"
        (input)="form.setData('name', $any($event.target).value)"
      />
      @if (form.errors().name) {
        <p class="text-red-600">{{ form.errors().name }}</p>
      }
      <button class="rounded bg-slate-900 px-4 py-2 text-white" type="submit" [disabled]="form.processing()">
        Save
      </button>
    </form>
  `,
})
class FormPage {
  readonly form = useForm({ name: '' })

  submit(event: SubmitEvent): void {
    event.preventDefault()
    this.form.post('/form')
  }
}

@Component({
  selector: 'playground-precognition',
  imports: [Form, Head],
  template: `
    <ng-template inertiaHead title="Precognition" />
    <h1 class="text-2xl font-semibold">Precognition</h1>
    <form inertiaForm method="post" action="/precognition" #form="inertiaForm" class="mt-4 space-y-3">
      <input class="block border p-2" name="email" type="email" (blur)="form.validate('email')" />
      @if (form.errors().email) {
        <p class="text-red-600">{{ form.errors().email }}</p>
      }
      <button class="rounded bg-slate-900 px-4 py-2 text-white" type="submit">Validate</button>
    </form>
  `,
})
class PrecognitionPage {}

@Component({
  selector: 'playground-deferred',
  imports: [Deferred, DeferredContent, DeferredFallback, Head],
  template: `
    <ng-template inertiaHead title="Deferred" />
    <h1 class="text-2xl font-semibold">Deferred props</h1>
    <inertia-deferred data="stats">
      <ng-template inertiaDeferredFallback><p>Loading stats…</p></ng-template>
      <ng-template inertiaDeferredContent
        ><p>Total users: {{ stats()?.users }}</p></ng-template
      >
    </inertia-deferred>
  `,
})
class DeferredPage {
  readonly stats = input<{ users: number }>()
}

@Component({
  selector: 'playground-poll',
  imports: [Head],
  template:
    '<ng-template inertiaHead title="Polling" /><h1 class="text-2xl font-semibold">Polling</h1><p>{{ now() }}</p>',
})
class PollPage {
  readonly now = input('')

  constructor() {
    usePoll(2_000, { only: ['now'] })
  }
}

type Contact = { id: number; name: string; favorite: boolean }

@Component({
  selector: 'playground-optimistic',
  imports: [Head],
  template: `
    <ng-template inertiaHead title="Optimistic updates" />
    <h1 class="text-2xl font-semibold">Optimistic updates</h1>
    @for (contact of contacts(); track contact.id) {
      <button class="block" type="button" (click)="toggle(contact)">
        {{ contact.favorite ? '★' : '☆' }} {{ contact.name }}
      </button>
    }
  `,
})
class OptimisticPage {
  readonly contacts = input<Contact[]>([])
  readonly form = useForm({ id: 0 })

  toggle(contact: Contact): void {
    this.form.setData('id', contact.id)
    this.form
      .optimistic<{ contacts: Contact[] }>((props) => ({
        contacts: props.contacts.map((item) => (item.id === contact.id ? { ...item, favorite: !item.favorite } : item)),
      }))
      .post('/optimistic')
  }
}

@Component({
  selector: 'playground-infinite',
  imports: [Head, InfiniteScroll],
  template: `
    <ng-template inertiaHead title="Infinite scroll" />
    <h1 class="text-2xl font-semibold">Infinite scroll</h1>
    <div [inertiaInfiniteScroll]="'users'" class="space-y-2">
      @for (user of users().data; track user.id) {
        <p>{{ user.name }}</p>
      }
    </div>
  `,
})
class InfinitePage {
  readonly users = input.required<{ data: User[] }>()
}

export const pages: Record<string, ResolvedComponent> = {
  Home,
  Users,
  Form: FormPage,
  Precognition: PrecognitionPage,
  Defer: DeferredPage,
  Poll: PollPage,
  Optimistic: OptimisticPage,
  InfiniteScroll: InfinitePage,
}
