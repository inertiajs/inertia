<script setup lang="ts">
import { router } from '@inertiajs/vue3'
import { ref } from 'vue'

interface Todo {
  id: number
  name: string
  done: boolean
}

defineProps<{
  todos: Todo[]
  errors?: Record<string, string>
  serverTimestamp?: number
}>()

const newTodoName = ref('')
const errorCount = ref(0)
const successCount = ref(0)

const addTodo = () => {
  const name = newTodoName.value.trim()
  const optimisticName = name || '(empty todo...)'
  newTodoName.value = ''

  router.post(
    '/optimistic/todos',
    { name },
    {
      preserveScroll: true,
      optimistic: (pageProps) => ({
        todos: [...(pageProps.todos as Todo[]), { id: Date.now(), name: optimisticName, done: false }],
      }),
      onSuccess: () => {
        successCount.value++
        newTodoName.value = ''
      },
      onError: () => {
        errorCount.value++
        newTodoName.value = name
        document.getElementById('new-todo')?.focus()
      },
    },
  )
}

const toggleTodo = (todo: Todo) => {
  router.patch(
    `/optimistic/todos/${todo.id}`,
    { done: !todo.done },
    {
      preserveScroll: true,
      optimistic: (pageProps) => ({
        todos: (pageProps.todos as Todo[]).map((t) => (t.id === todo.id ? { ...t, done: !t.done } : t)),
      }),
    },
  )
}

const deleteTodo = (todo: Todo) => {
  router.delete(`/optimistic/todos/${todo.id}`, {
    preserveScroll: true,
    optimistic: (pageProps) => ({
      todos: (pageProps.todos as Todo[]).filter((t) => t.id !== todo.id),
    }),
  })
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
</script>

<template>
  <div>
    <h1>Optimistic Updates</h1>

    <div class="add-form" style="display: flex; align-items: flex-start; gap: 8px">
      <div style="display: flex; flex-direction: column; min-width: 300px">
        <input
          id="new-todo"
          v-model="newTodoName"
          type="text"
          placeholder="What needs to be done?"
          @keyup.enter="addTodo"
        />
        <p v-if="errors?.name" class="error" style="margin: 4px 0 0">{{ errors.name }}</p>
      </div>
      <button id="add-btn" @click="addTodo">Add Todo</button>
    </div>

    <ul id="todo-list">
      <li v-for="todo in todos" :key="todo.id" class="todo-item">
        <input type="checkbox" :checked="todo.done" @change="toggleTodo(todo)" />
        <span :style="{ textDecoration: todo.done ? 'line-through' : 'none' }">
          {{ todo.name }}
        </span>
        <button @click="deleteTodo(todo)">Delete</button>
      </li>
    </ul>

    <div class="actions">
      <button id="clear-btn" @click="clearTodos">Reset</button>
      <button id="server-error-btn" @click="triggerServerError">Trigger Server Error</button>
    </div>

    <div class="counters">
      <div id="success-count">Success: {{ successCount }}</div>
      <div id="error-count">Error: {{ errorCount }}</div>
      <div v-if="serverTimestamp" id="server-timestamp">Server timestamp: {{ serverTimestamp }}</div>
    </div>
  </div>
</template>
