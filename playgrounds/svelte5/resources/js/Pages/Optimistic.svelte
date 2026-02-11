<script>
  import { router, useForm } from '@inertiajs/svelte'

  let { appName, todos } = $props()

  let newTodoName = $state('')

  let addForm = useForm({ name: '' })

  function addTodo(e) {
    e.preventDefault()

    const name = newTodoName.trim()
    newTodoName = ''

    addForm.name = name

    addForm
      .optimistic((props) => ({
        todos: [...props.todos, { id: Date.now(), name: name || '(empty)', done: false }],
      }))
      .post('/optimistic', {
        preserveScroll: true,
        onSuccess: () => {
          newTodoName = ''
        },
        onError: () => {
          newTodoName = name
        },
      })
  }

  function toggleTodo(todo) {
    router
      .optimistic((props) => ({
        todos: props.todos.map((t) => (t.id === todo.id ? { ...t, done: !t.done } : t)),
      }))
      .patch(`/optimistic/${todo.id}`, {}, { preserveScroll: true })
  }

  function deleteTodo(todo) {
    router
      .optimistic((props) => ({
        todos: props.todos.filter((t) => t.id !== todo.id),
      }))
      .delete(`/optimistic/${todo.id}`, { preserveScroll: true })
  }

  function resetTodos() {
    router
      .optimistic(() => ({ todos: [] }))
      .post('/optimistic/reset')
  }
</script>

<svelte:head>
  <title>Optimistic - {appName}</title>
</svelte:head>

<h1 class="text-3xl">Optimistic</h1>

<div class="mt-6 max-w-md space-y-4">
  <form onsubmit={addTodo} class="flex gap-2">
    <div class="flex-1">
      <input
        bind:value={newTodoName}
        type="text"
        placeholder="What needs to be done?"
        class="w-full appearance-none rounded-sm border border-gray-200 px-2 py-1 shadow-xs"
      />
      {#if addForm.errors.name}
        <div class="mt-2 text-sm text-red-600">{addForm.errors.name}</div>
      {/if}
    </div>
    <button type="submit" class="rounded-sm bg-slate-800 px-4 py-1 text-white">Add</button>
  </form>

  <ul class="space-y-2">
    {#each todos as todo (todo.id)}
      <li class="flex items-center gap-2 rounded-sm border border-gray-200 px-3 py-2">
        <input type="checkbox" checked={todo.done} onchange={() => toggleTodo(todo)} />
        <span class="flex-1" class:line-through={todo.done} class:text-gray-400={todo.done}>{todo.name}</span>
        <button onclick={() => deleteTodo(todo)} class="text-sm text-red-600">Delete</button>
      </li>
    {/each}
  </ul>

  <div>
    <button type="button" onclick={resetTodos} class="text-sm text-gray-500 underline">Reset</button>
  </div>
</div>
