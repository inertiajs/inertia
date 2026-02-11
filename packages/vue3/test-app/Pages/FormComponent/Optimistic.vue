<script setup lang="ts">
import { Form } from '@inertiajs/vue3'

interface Todo {
  id: number
  name: string
  done: boolean
}

defineProps<{
  todos: Todo[]
}>()
</script>

<template>
  <div>
    <h1>Form Component Optimistic</h1>

    <Form
      method="post"
      action="/form-component/optimistic"
      :optimistic="
        (props, data) => ({
          todos: [...(props.todos as Todo[]), { id: Date.now(), name: data.name || '(empty todo...)', done: false }],
        })
      "
      :options="{ preserveScroll: true }"
    >
      <template #default="{ processing }">
        <input id="name-input" type="text" name="name" />
        <button id="submit-btn" type="submit" :disabled="processing">Add Todo</button>
      </template>
    </Form>

    <ul id="todo-list">
      <li v-for="todo in todos" :key="todo.id" class="todo-item">
        <span>{{ todo.name }}</span>
      </li>
    </ul>

    <div id="todo-count">Count: {{ todos.length }}</div>
  </div>
</template>
