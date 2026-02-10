<script setup lang="ts">
import { useHttp } from '@inertiajs/vue3'

const optimisticForm = useHttp<{ name: string }, { success: boolean; id: number; name: string }>({
  name: '',
})

const optimisticInlineForm = useHttp<{ name: string }, { success: boolean; id: number; name: string }>({
  name: '',
})

const performOptimistic = async () => {
  try {
    await optimisticForm
      .optimistic((data) => ({ ...data, name: data.name + ' (saving...)' }))
      .post('/api/optimistic-todo')
  } catch {
    // Errors stored in form
  }
}

const performOptimisticInline = async () => {
  try {
    await optimisticInlineForm.post('/api/optimistic-todo', {
      optimistic: (data) => ({ ...data, name: data.name + ' (saving...)' }),
    })
  } catch {
    // Errors stored in form
  }
}
</script>

<template>
  <div>
    <h1>useHttp Optimistic</h1>

    <!-- Optimistic (fluent) Test -->
    <section id="optimistic-test">
      <h2>Optimistic (fluent)</h2>
      <input type="text" id="optimistic-name" v-model="optimisticForm.name" />
      <button @click="performOptimistic" id="optimistic-button">Submit</button>
      <div id="optimistic-current-name">Name: {{ optimisticForm.name }}</div>
      <div v-if="optimisticForm.processing" id="optimistic-processing">Processing...</div>
      <div v-if="optimisticForm.wasSuccessful" id="optimistic-success">Success!</div>
      <div v-if="optimisticForm.errors.name" id="optimistic-error">{{ optimisticForm.errors.name }}</div>
    </section>

    <!-- Optimistic (inline) Test -->
    <section id="optimistic-inline-test">
      <h2>Optimistic (inline)</h2>
      <input type="text" id="optimistic-inline-name" v-model="optimisticInlineForm.name" />
      <button @click="performOptimisticInline" id="optimistic-inline-button">Submit</button>
      <div id="optimistic-inline-current-name">Name: {{ optimisticInlineForm.name }}</div>
      <div v-if="optimisticInlineForm.processing" id="optimistic-inline-processing">Processing...</div>
      <div v-if="optimisticInlineForm.wasSuccessful" id="optimistic-inline-success">Success!</div>
      <div v-if="optimisticInlineForm.errors.name" id="optimistic-inline-error">
        {{ optimisticInlineForm.errors.name }}
      </div>
    </section>
  </div>
</template>
