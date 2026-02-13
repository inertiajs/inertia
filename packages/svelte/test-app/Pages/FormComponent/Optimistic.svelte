<script lang="ts">
  import { Form } from '@inertiajs/svelte'

  interface Todo {
    id: number
    name: string
    done: boolean
  }

  interface Props {
    todos: Todo[]
  }

  let { todos }: Props = $props()
</script>

<div>
  <h1>Form Component Optimistic</h1>

  <Form
    method="post"
    action="/form-component/optimistic"
    optimistic={(props, data) => ({
      todos: [...(props.todos as Todo[]), { id: Date.now(), name: data.name || '(empty todo...)', done: false }],
    })}
    options={{ preserveScroll: true }}
  >
    {#snippet children({ processing })}
      <input id="name-input" type="text" name="name" />
      <button id="submit-btn" type="submit" disabled={processing}>Add Todo</button>
    {/snippet}
  </Form>

  <ul id="todo-list">
    {#each todos as todo (todo.id)}
      <li class="todo-item">
        <span>{todo.name}</span>
      </li>
    {/each}
  </ul>

  <div id="todo-count">Count: {todos.length}</div>
</div>
