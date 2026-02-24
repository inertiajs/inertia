<script setup lang="ts">
import { router, useForm } from '@inertiajs/vue3'
import { ref } from 'vue'

interface Todo {
  id: number
  name: string
  done: boolean
}

defineProps<{
  todos: Todo[]
  likes?: number
  foo?: string
  errors?: Record<string, string>
  serverTimestamp?: number
}>()

const newTodoName = ref('')
const errorCount = ref(0)
const successCount = ref(0)

const addForm = useForm({ name: '' })

const addTodo = () => {
  const name = newTodoName.value.trim()
  const optimisticName = name || '(empty todo...)'
  newTodoName.value = ''

  addForm.name = name

  addForm
    .optimistic<{ todos: Todo[] }>((props) => ({
      todos: [...props.todos, { id: Date.now(), name: optimisticName, done: false }],
    }))
    .post('/optimistic/todos', {
      preserveScroll: true,
      onSuccess: () => {
        successCount.value++
        newTodoName.value = ''
      },
      onError: () => {
        errorCount.value++
        newTodoName.value = name
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

    <div class="likes" style="margin: 16px 0">
      <span id="likes-count">Likes: {{ likes }}</span>
      <button id="like-btn" @click="like()">Like</button>
      <button id="like-slow-btn" @click="likeSlow(800)">Like (slow)</button>
      <button id="like-fast-btn" @click="likeSlow(100)">Like (fast)</button>
      <button id="like-controlled-slow-btn" @click="likeControlled(800, 5)">Like Controlled (slow, 5)</button>
      <button id="like-controlled-fast-btn" @click="likeControlled(100, 3)">Like Controlled (fast, 3)</button>
      <button id="like-same-url-btn" @click="likeSameUrl(500)">Like Same URL</button>
      <button id="like-and-redirect-btn" @click="likeAndRedirect(500)">Like &amp; Redirect</button>
      <button id="like-error-btn" @click="likeError(100)">Like Error (fast)</button>
      <button id="like-triple-btn" @click="likeTriple">Like Triple</button>
      <button id="reset-likes-btn" @click="resetLikes">Reset Likes</button>
    </div>

    <div v-if="foo" id="foo-value">Foo: {{ foo }}</div>

    <div class="counters">
      <div id="success-count">Success: {{ successCount }}</div>
      <div id="error-count">Error: {{ errorCount }}</div>
      <div v-if="serverTimestamp" id="server-timestamp">Server timestamp: {{ serverTimestamp }}</div>
    </div>
  </div>
</template>
