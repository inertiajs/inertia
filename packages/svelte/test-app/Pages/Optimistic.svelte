<script>
  import { router } from '@inertiajs/svelte'

  export let todos

  let newTodoName = ''
  let errorCount = 0
  let cancelCount = 0
  let successCount = 0
  let errors = {}

  const addTodo = () => {
    const name = newTodoName.trim()
    const optimisticName = name || '(empty todo...)'
    newTodoName = ''
    errors = {}

    router.post(
      '/optimistic/todos',
      { name },
      {
        preserveScroll: true,
        optimistic: (pageProps) => ({
          todos: [...pageProps.todos, { id: Date.now(), name: optimisticName, done: false }],
        }),
        onSuccess: () => {
          successCount++
          newTodoName = ''
        },
        onError: (err) => {
          errorCount++
          newTodoName = name
          errors = err
          document.getElementById('new-todo')?.focus()
        },
      },
    )
  }

  const toggleTodo = (todo) => {
    router.patch(
      `/optimistic/todos/${todo.id}`,
      { done: !todo.done },
      {
        preserveScroll: true,
        optimistic: (pageProps) => ({
          todos: pageProps.todos.map((t) => (t.id === todo.id ? { ...t, done: !t.done } : t)),
        }),
      },
    )
  }

  const deleteTodo = (todo) => {
    router.delete(`/optimistic/todos/${todo.id}`, {
      preserveScroll: true,
      optimistic: (pageProps) => ({
        todos: pageProps.todos.filter((t) => t.id !== todo.id),
      }),
    })
  }

  const clearTodos = () => {
    router.post('/optimistic/clear')
  }

  const handleKeyUp = (e) => {
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
  </div>

  <div class="counters">
    <div id="success-count">Success: {successCount}</div>
    <div id="error-count">Error: {errorCount}</div>
    <div id="cancel-count">Cancel: {cancelCount}</div>
  </div>
</div>
