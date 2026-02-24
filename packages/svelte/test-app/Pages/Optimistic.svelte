<script lang="ts">
  import { router, useForm } from '@inertiajs/svelte'

  interface Todo {
    id: number
    name: string
    done: boolean
  }

  interface Props {
    todos: Todo[]
    likes?: number
    foo?: string
    errors?: Record<string, string>
    serverTimestamp?: number | null
  }

  let { todos, likes = 0, foo, errors = {}, serverTimestamp = null }: Props = $props()

  let newTodoName = $state('')
  let errorCount = $state(0)
  let successCount = $state(0)

  const addForm = useForm({ name: '' })

  const addTodo = () => {
    const name = newTodoName.trim()
    const optimisticName = name || '(empty todo...)'
    newTodoName = ''

    addForm.name = name

    addForm
      .optimistic<{ todos: Todo[] }>((props) => ({
        todos: [...props.todos, { id: Date.now(), name: optimisticName, done: false }],
      }))
      .post('/optimistic/todos', {
        preserveScroll: true,
        onSuccess: () => {
          successCount++
          newTodoName = ''
        },
        onError: () => {
          errorCount++
          newTodoName = name
          document.getElementById('new-todo')?.focus()
        },
      })
  }

  const toggleTodo = (todo: Todo) => {
    router
      .optimistic<{ todos: Todo[] }>((props) => ({
        todos: props.todos.map((t) => (t.id === todo.id ? { ...t, done: !t.done } : t)),
      }))
      .patch(`/optimistic/todos/${todo.id}`, { done: !todo.done }, { preserveScroll: true })
  }

  const deleteTodo = (todo: Todo) => {
    router
      .optimistic<{ todos: Todo[] }>((props) => ({
        todos: props.todos.filter((t) => t.id !== todo.id),
      }))
      .delete(`/optimistic/todos/${todo.id}`, { preserveScroll: true })
  }

  const clearTodos = () => {
    router.post('/optimistic/clear')
  }

  const like = () => {
    router
      .optimistic<{ likes: number }>((props) => ({
        likes: (props.likes as number) + 1,
      }))
      .post('/optimistic/like', {}, { preserveScroll: true })
  }

  const likeSlow = (delay: number) => {
    router
      .optimistic<{ likes: number }>((props) => ({
        likes: (props.likes as number) + 1,
      }))
      .post(`/optimistic/like?delay=${delay}`, {}, { preserveScroll: true })
  }

  const likeControlled = (delay: number, serverLikes: number) => {
    router
      .optimistic<{ likes: number }>((props) => ({
        likes: (props.likes as number) + 1,
      }))
      .post(`/optimistic/like-controlled?delay=${delay}&likes=${serverLikes}`, {}, { preserveScroll: true })
  }

  const likeTriple = () => {
    router
      .optimistic<{ likes: number }>((props) => ({ likes: (props.likes as number) + 1 }))
      .post('/optimistic/like-controlled?delay=300&likes=1', {}, { preserveScroll: true })

    router
      .optimistic<{ likes: number }>((props) => ({ likes: (props.likes as number) + 1 }))
      .post('/optimistic/like-controlled?delay=600&likes=2&foo=bar_updated', {}, { preserveScroll: true })

    router
      .optimistic<{ likes: number }>((props) => ({ likes: (props.likes as number) + 1 }))
      .post('/optimistic/like-controlled?delay=900&likes=3&foo=bar_updated_twice', {}, { preserveScroll: true })
  }

  const likeSameUrl = (delay: number) => {
    router
      .optimistic<{ likes: number }>((props) => ({
        likes: (props.likes as number) + 1,
      }))
      .post(`/optimistic?delay=${delay}`, {}, { preserveScroll: true })
  }

  const likeAndRedirect = (delay: number) => {
    router
      .optimistic<{ likes: number }>((props) => ({
        likes: (props.likes as number) + 1,
      }))
      .post(`/optimistic/like-and-redirect?delay=${delay}`, {}, { preserveScroll: true })
  }

  const likeError = (delay: number) => {
    router
      .optimistic<{ likes: number }>((props) => ({
        likes: (props.likes as number) + 1,
      }))
      .post(`/optimistic/like-error?delay=${delay}`, {}, { preserveScroll: true })
  }

  const resetLikes = () => {
    router.post('/optimistic/reset-likes')
  }

  const triggerServerError = () => {
    router.post(
      '/optimistic/server-error',
      {},
      {
        preserveScroll: true,
        optimistic: (pageProps) => ({
          todos: [...(pageProps.todos as Todo[]), { id: Date.now(), name: 'Will fail...', done: false }],
        }),
      },
    )
  }

  const handleKeyUp = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTodo()
    }
  }
</script>

<div>
  <h1>Optimistic Updates</h1>

  <div class="add-form" style="display: flex; align-items: flex-start; gap: 8px">
    <div style="display: flex; flex-direction: column; min-width: 300px">
      <input
        id="new-todo"
        type="text"
        bind:value={newTodoName}
        placeholder="What needs to be done?"
        onkeyup={handleKeyUp}
      />
      {#if errors?.name}
        <p class="error" style="margin: 4px 0 0">{errors.name}</p>
      {/if}
    </div>
    <button id="add-btn" onclick={addTodo}>Add Todo</button>
  </div>

  <ul id="todo-list">
    {#each todos as todo (todo.id)}
      <li class="todo-item">
        <input type="checkbox" checked={todo.done} onchange={() => toggleTodo(todo)} />
        <span style="text-decoration: {todo.done ? 'line-through' : 'none'}">
          {todo.name}
        </span>
        <button onclick={() => deleteTodo(todo)}>Delete</button>
      </li>
    {/each}
  </ul>

  <div class="actions">
    <button id="clear-btn" onclick={clearTodos}>Reset</button>
    <button id="server-error-btn" onclick={triggerServerError}>Trigger Server Error</button>
  </div>

  <div class="likes" style="margin: 16px 0">
    <span id="likes-count">Likes: {likes}</span>
    <button id="like-btn" onclick={() => like()}>Like</button>
    <button id="like-slow-btn" onclick={() => likeSlow(800)}>Like (slow)</button>
    <button id="like-fast-btn" onclick={() => likeSlow(100)}>Like (fast)</button>
    <button id="like-controlled-slow-btn" onclick={() => likeControlled(800, 5)}>Like Controlled (slow, 5)</button>
    <button id="like-controlled-fast-btn" onclick={() => likeControlled(100, 3)}>Like Controlled (fast, 3)</button>
    <button id="like-same-url-btn" onclick={() => likeSameUrl(500)}>Like Same URL</button>
    <button id="like-and-redirect-btn" onclick={() => likeAndRedirect(500)}>Like & Redirect</button>
    <button id="like-error-btn" onclick={() => likeError(100)}>Like Error (fast)</button>
    <button id="like-triple-btn" onclick={likeTriple}>Like Triple</button>
    <button id="reset-likes-btn" onclick={resetLikes}>Reset Likes</button>
  </div>

  {#if foo}
    <div id="foo-value">Foo: {foo}</div>
  {/if}

  <div class="counters">
    <div id="success-count">Success: {successCount}</div>
    <div id="error-count">Error: {errorCount}</div>
    {#if serverTimestamp}
      <div id="server-timestamp">Server timestamp: {serverTimestamp}</div>
    {/if}
  </div>
</div>
