<script setup lang="ts">
import { Head, router, useForm } from '@inertiajs/vue3'
import { ref } from 'vue'

interface Todo {
  id: number
  name: string
  done: boolean
}

const props = defineProps<{
  todos: Todo[]
}>()

const newTodoName = ref('')

const addForm = useForm({ name: '' })

const addTodo = () => {
  const name = newTodoName.value.trim()
  newTodoName.value = ''

  addForm.name = name

  addForm
    .optimistic<{ todos: Todo[] }>((props) => ({
      todos: [...props.todos, { id: Date.now(), name: name || '(empty)', done: false }],
    }))
    .post('/optimistic', {
      preserveScroll: true,
      onSuccess: () => {
        newTodoName.value = ''
      },
      onError: () => {
        newTodoName.value = name
      },
    })
}

const toggleTodo = (todo: Todo) => {
  router
    .optimistic<{ todos: Todo[] }>((props) => ({
      todos: props.todos.map((t) => (t.id === todo.id ? { ...t, done: !t.done } : t)),
    }))
    .patch(`/optimistic/${todo.id}`, {}, { preserveScroll: true })
}

const deleteTodo = (todo: Todo) => {
  router
    .optimistic<{ todos: Todo[] }>((props) => ({
      todos: props.todos.filter((t) => t.id !== todo.id),
    }))
    .delete(`/optimistic/${todo.id}`, { preserveScroll: true })
}

const resetTodos = () => {
  router
    .optimistic<{ todos: Todo[] }>(() => ({ todos: [] }))
    .post('/optimistic/reset')
}
</script>

<template>
  <Head title="Optimistic" />
  <h1 class="text-3xl">Optimistic</h1>
  <div class="mt-6 max-w-md space-y-4">
    <form @submit.prevent="addTodo" class="flex gap-2">
      <div class="flex-1">
        <input
          v-model="newTodoName"
          type="text"
          placeholder="What needs to be done?"
          class="w-full appearance-none rounded-sm border border-gray-200 px-2 py-1 shadow-xs"
        />
        <div v-if="addForm.errors.name" class="mt-2 text-sm text-red-600">{{ addForm.errors.name }}</div>
      </div>
      <button type="submit" class="rounded-sm bg-slate-800 px-4 py-1 text-white">Add</button>
    </form>

    <ul class="space-y-2">
      <li v-for="todo in todos" :key="todo.id" class="flex items-center gap-2 rounded-sm border border-gray-200 px-3 py-2">
        <input type="checkbox" :checked="todo.done" @change="toggleTodo(todo)" />
        <span class="flex-1" :class="{ 'line-through text-gray-400': todo.done }">{{ todo.name }}</span>
        <button @click="deleteTodo(todo)" class="text-sm text-red-600">Delete</button>
      </li>
    </ul>

    <div>
      <button type="button" @click="resetTodos" class="text-sm text-gray-500 underline">Reset</button>
    </div>
  </div>
</template>
