<script lang="ts">
import Layout from '../Components/Layout.vue'
export default { layout: Layout }
</script>

<script setup lang="ts">
import { Head, Link, router } from '@inertiajs/vue3'

import { useForm } from 'laravel-precognition-vue'

const form = useForm('post', '/users', {
  name: '',
  email: '',
})

form.setValidationTimeout(3000)

console.log(form)

const submit = () => form.submit()

const validate = () =>
  form.validate({
    only: ['name', 'email'],
  })
</script>

<template>
  <Head title="Home" />
  <h1 class="text-3xl">Home</h1>
  <div class="mt-6 space-y-4">
    <div>
      <Link href="/article#far-down" class="text-blue-700 underline">Link to bottom of article page</Link>
    </div>

    <div>
      <button type="button" @click="router.clearHistory()" class="rounded-lg bg-blue-500 px-4 py-2 text-white">
        Clear History
      </button>
    </div>

    <div>
      <button type="button" @click="validate" class="rounded-lg bg-blue-500 px-4 py-2 text-white">PValidate</button>
    </div>

    <form @submit.prevent="submit">
      <div v-if="form.validating">Validating...</div>

      <label for="name">Name</label>
      <input id="name" v-model="form.name" @change="form.validate('name')" />
      <div v-if="form.invalid('name')">
        {{ form.errors.name }}
      </div>

      <label for="email">Email</label>
      <input id="email" type="email" v-model="form.email" @change="form.validate('email')" />
      <div v-if="form.invalid('email')">
        {{ form.errors.email }}
      </div>

      <button :disabled="form.processing">Create User</button>
    </form>
  </div>
</template>
