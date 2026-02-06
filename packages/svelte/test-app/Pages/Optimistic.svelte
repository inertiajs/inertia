<script lang="ts">
  import { router, useForm } from '@inertiajs/svelte'

  interface Todo {
    id: number
    name: string
    done: boolean
  }

  export let todos: Todo[]
  export let errors: Record<string, string> = {}
  export let serverTimestamp: number | null = null

  let newTodoName = ''
  let errorCount = 0
  let successCount = 0

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
        on:keyup={handleKeyUp}
      />
      {#if errors?.name}
        <p class="error" style="margin: 4px 0 0">{errors.name}</p>
      {/if}
    </div>
    <button id="add-btn" on:click={addTodo}>Add Todo</button>
  </div>

  <ul id="todo-list">
    {#each todos as todo (todo.id)}
      <li class="todo-item">
        <input type="checkbox" checked={todo.done} on:change={() => toggleTodo(todo)} />
        <span style="text-decoration: {todo.done ? 'line-through' : 'none'}">
          {todo.name}
        </span>
        <button on:click={() => deleteTodo(todo)}>Delete</button>
      </li>
    {/each}
  </ul>

  <div class="actions">
    <button id="clear-btn" on:click={clearTodos}>Reset</button>
    <button id="server-error-btn" on:click={triggerServerError}>Trigger Server Error</button>
  </div>

  <div class="counters">
    <div id="success-count">Success: {successCount}</div>
    <div id="error-count">Error: {errorCount}</div>
    {#if serverTimestamp}
      <div id="server-timestamp">Server timestamp: {serverTimestamp}</div>
    {/if}
  </div>
</div>
