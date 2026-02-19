<script setup lang="ts">
import { useHttp } from '@inertiajs/vue3'

interface ValidateResponse {
  success: boolean
}

const simpleErrors = useHttp<{ name: string; email: string }, ValidateResponse>({
  name: '',
  email: '',
})

const allErrors = useHttp<{ name: string; email: string }, ValidateResponse>({
  name: '',
  email: '',
}).withAllErrors()

const submitSimple = async () => {
  try {
    await simpleErrors.post('/api/validate-multiple')
  } catch {
    // Errors are stored in form.errors
  }
}

const submitAll = async () => {
  try {
    await allErrors.post('/api/validate-multiple')
  } catch {
    // Errors are stored in form.errors
  }
}
</script>

<template>
  <div>
    <h1>useHttp withAllErrors Test</h1>

    <section id="simple-errors">
      <h2>Simple Errors (default)</h2>
      <button @click="submitSimple" id="simple-submit">Submit</button>
      <div v-if="simpleErrors.hasErrors" id="simple-has-errors">Has errors</div>
      <div v-if="simpleErrors.errors.name" id="simple-name-error">Name: {{ simpleErrors.errors.name }}</div>
      <div v-if="simpleErrors.errors.email" id="simple-email-error">Email: {{ simpleErrors.errors.email }}</div>
    </section>

    <section id="all-errors">
      <h2>All Errors (withAllErrors)</h2>
      <button @click="submitAll" id="all-submit">Submit</button>
      <div v-if="allErrors.hasErrors" id="all-has-errors">Has errors</div>
      <div v-if="allErrors.errors.name" id="all-name-error">Name: {{ allErrors.errors.name }}</div>
      <div v-if="allErrors.errors.email" id="all-email-error">Email: {{ allErrors.errors.email }}</div>
    </section>
  </div>
</template>
