<script lang="ts">
import Layout from '../Components/Layout.vue'
export default { layout: Layout }
</script>

<script setup lang="ts">
import { Head, useForm } from '@inertiajs/vue3'

const form = useForm({
  name: '',
  company: '',
  role: '',
})
</script>

<template>
  <Head title="Form" />
  <h1 class="text-3xl">Form</h1>
  <form @submit.prevent="form.post('/user')" class="mt-6 max-w-md space-y-4">
    <div>
      <label class="block" for="name">Name:</label>
      <input
        type="text"
        v-model="form.name"
        id="name"
        class="mt-1 w-full appearance-none rounded border px-2 py-1 shadow-sm"
      />
      <div v-if="form.errors.name" class="mt-2 text-sm text-red-600">{{ form.errors.name }}</div>
    </div>
    <div>
      <label class="block" for="company">Company:</label>
      <input
        type="text"
        v-model="form.company"
        id="company"
        class="mt-1 w-full appearance-none rounded border px-2 py-1 shadow-sm"
      />
      <div v-if="form.errors.company" class="mt-2 text-sm text-red-600">{{ form.errors.company }}</div>
    </div>
    <div>
      <label class="block" for="role">Role:</label>
      <select v-model="form.role" id="role" class="mt-1 w-full appearance-none rounded border px-2 py-1 shadow-sm">
        <option></option>
        <option>User</option>
        <option>Admin</option>
        <option>Super</option>
      </select>
      <div v-if="form.errors.role" class="mt-2 text-sm text-red-600">{{ form.errors.role }}</div>
    </div>
    <div>
      <button type="submit" :disabled="form.processing" class="rounded bg-slate-800 px-6 py-2 text-white">
        Submit
      </button>
    </div>
  </form>
</template>
