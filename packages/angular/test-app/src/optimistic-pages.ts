import { Component, input, signal } from '@angular/core'
import { router, useForm, type ResolvedComponent } from '@inertiajs/angular'

type Todo = { id: number; name: string; done: boolean }

@Component({
  selector: 'test-optimistic',
  template: `
    <h1>Optimistic Updates</h1>
    <div class="add-form">
      <input
        id="new-todo"
        type="text"
        [value]="newTodoName()"
        (input)="setName($event)"
        (keyup.enter)="addTodo()"
        placeholder="What needs to be done?"
      />
      @if (errors()?.name; as error) {
        <p class="error">{{ error }}</p>
      }
      <button id="add-btn" type="button" (click)="addTodo()">Add Todo</button>
    </div>
    <ul id="todo-list">
      @for (todo of todos(); track todo.id) {
        <li class="todo-item">
          <input type="checkbox" [checked]="todo.done" (change)="toggleTodo(todo)" /><span
            [style.text-decoration]="todo.done ? 'line-through' : 'none'"
            >{{ todo.name }}</span
          ><button type="button" (click)="deleteTodo(todo)">Delete</button>
        </li>
      }
    </ul>
    <div class="actions">
      <button id="clear-btn" type="button" (click)="router.post('/optimistic/clear')">Reset</button
      ><button id="server-error-btn" type="button" (click)="triggerServerError()">Trigger Server Error</button>
    </div>
    <div class="likes">
      <span id="likes-count">Likes: {{ likes() }}</span>
      <button id="like-btn" type="button" (click)="like('/optimistic/like')">Like</button>
      <button id="like-slow-btn" type="button" (click)="like('/optimistic/like?delay=800')">Like (slow)</button>
      <button id="like-fast-btn" type="button" (click)="like('/optimistic/like?delay=100')">Like (fast)</button>
      <button
        id="like-controlled-slow-btn"
        type="button"
        (click)="like('/optimistic/like-controlled?delay=800&likes=5')"
      >
        Like Controlled (slow, 5)
      </button>
      <button
        id="like-controlled-fast-btn"
        type="button"
        (click)="like('/optimistic/like-controlled?delay=100&likes=3')"
      >
        Like Controlled (fast, 3)
      </button>
      <button id="like-same-url-btn" type="button" (click)="like('/optimistic?delay=500')">Like Same URL</button>
      <button id="like-and-redirect-btn" type="button" (click)="like('/optimistic/like-and-redirect?delay=500')">
        Like &amp; Redirect
      </button>
      <button id="like-error-btn" type="button" (click)="like('/optimistic/like-error?delay=250')">
        Like Error (fast)
      </button>
      <button id="like-triple-btn" type="button" (click)="likeTriple()">Like Triple</button>
      <button id="reset-likes-btn" type="button" (click)="router.post('/optimistic/reset-likes')">Reset Likes</button>
    </div>
    @if (foo(); as value) {
      <div id="foo-value">Foo: {{ value }}</div>
    }
    <div class="counters">
      <div id="success-count">Success: {{ successCount() }}</div>
      <div id="error-count">Error: {{ errorCount() }}</div>
      @if (serverTimestamp(); as timestamp) {
        <div id="server-timestamp">Server timestamp: {{ timestamp }}</div>
      }
    </div>
  `,
})
class OptimisticPage {
  readonly todos = input.required<Todo[]>()
  readonly likes = input(0)
  readonly foo = input<string>()
  readonly errors = input<{ name?: string }>()
  readonly serverTimestamp = input<number>()
  readonly newTodoName = signal('')
  readonly errorCount = signal(0)
  readonly successCount = signal(0)
  readonly addForm = useForm({ name: '' })
  readonly router = router

  setName(event: Event): void {
    this.newTodoName.set((event.target as HTMLInputElement).value)
  }

  addTodo(): void {
    const name = this.newTodoName().trim()
    const optimisticName = name || '(empty todo...)'
    this.newTodoName.set('')
    this.addForm.transform(() => ({ name }))
    this.addForm
      .optimistic<{ todos: Todo[] }>((props) => ({
        todos: [...props.todos, { id: Date.now(), name: optimisticName, done: false }],
      }))
      .post('/optimistic/todos', {
        preserveScroll: true,
        onSuccess: () => {
          this.successCount.update((count) => count + 1)
          this.newTodoName.set('')
        },
        onError: () => {
          this.errorCount.update((count) => count + 1)
          this.newTodoName.set(name)
          document.querySelector<HTMLInputElement>('#new-todo')?.focus()
        },
      })
  }

  toggleTodo(todo: Todo): void {
    router
      .optimistic<{ todos: Todo[] }>((props) => ({
        todos: props.todos.map((item) => (item.id === todo.id ? { ...item, done: !item.done } : item)),
      }))
      .patch(`/optimistic/todos/${todo.id}`, { done: !todo.done }, { preserveScroll: true })
  }

  deleteTodo(todo: Todo): void {
    router
      .optimistic<{ todos: Todo[] }>((props) => ({ todos: props.todos.filter((item) => item.id !== todo.id) }))
      .delete(`/optimistic/todos/${todo.id}`, { preserveScroll: true })
  }

  like(url: string): void {
    router
      .optimistic<{ likes: number }>((props) => ({ likes: props.likes + 1 }))
      .post(url, {}, { preserveScroll: true })
  }

  likeTriple(): void {
    this.like('/optimistic/like-controlled?delay=300&likes=1')
    this.like('/optimistic/like-controlled?delay=600&likes=2&foo=bar_updated')
    this.like('/optimistic/like-controlled?delay=900&likes=3&foo=bar_updated_twice')
  }

  triggerServerError(): void {
    router.post(
      '/optimistic/server-error',
      {},
      {
        preserveScroll: true,
        optimistic: (props) => ({
          todos: [...(props['todos'] as Todo[]), { id: Date.now(), name: 'Will fail...', done: false }],
        }),
      },
    )
  }
}

type Contact = { id: number; name: string; is_favorite: boolean }

@Component({
  selector: 'test-optimistic-rollback',
  template: `
    <h1>Optimistic Rollback</h1>
    <div id="contact-list">
      @for (contact of contacts(); track contact.id) {
        <div class="contact-item">
          <span class="contact-name">{{ contact.name }}</span
          ><span class="contact-status">{{ contact.is_favorite ? 'Favorite' : 'Not Favorite' }}</span
          ><button class="toggle-btn" type="button" (click)="toggle(contact)">Toggle</button
          ><button class="toggle-error-btn" type="button" (click)="toggle(contact, 500, true)">Toggle (Error)</button
          ><button class="toggle-slow-btn" type="button" (click)="toggle(contact, 1000)">Toggle (Slow)</button
          ><button class="toggle-slow-error-btn" type="button" (click)="toggle(contact, 1000, true)">
            Toggle (Slow Error)
          </button>
        </div>
      }
    </div>
    @if (errors()?.toggle; as error) {
      <div id="error-message">{{ error }}</div>
    }
    <button id="reset-btn" type="button" (click)="router.post('/optimistic/rollback/reset')">Reset</button>
  `,
})
class OptimisticRollback {
  readonly contacts = input.required<Contact[]>()
  readonly errors = input<{ toggle?: string }>()
  readonly router = router
  toggle(contact: Contact, delay = 500, error = false): void {
    router
      .optimistic<{ contacts: Contact[] }>((props) => ({
        contacts: props.contacts.map((item) =>
          item.id === contact.id ? { ...item, is_favorite: !item.is_favorite } : item,
        ),
      }))
      .post(
        `/optimistic/rollback/toggle/${contact.id}?delay=${delay}&error=${error ? '1' : '0'}`,
        {},
        { preserveScroll: true },
      )
  }
}

export const optimisticPages: Record<string, ResolvedComponent> = {
  Optimistic: OptimisticPage,
  'Optimistic/Rollback': OptimisticRollback,
}
