<script lang="ts">
import Layout from '../Components/Layout.vue'
export default { layout: Layout }
</script>

<script setup lang="ts">
import { Head, useForm } from '@inertiajs/vue3'

const form = useForm('NewUser', {
  name: '',
  company: '',
  role: '',
})
</script>

<template>
  <Head title="Form" />
  <h1 class="text-3xl">Form</h1>
  <form @submit.prevent="form.post('/user')" class="mt-6 max-w-md space-y-4">
    <div v-if="form.isDirty" class="my-5 rounded-sm border border-amber-100 bg-amber-50 p-3 text-amber-800">
      There are unsaved changes!
    </div>
    <div>
      <label class="block" for="name">Name:</label>
      <input
        type="text"
        v-model="form.name"
        id="name"
        class="mt-1 w-full appearance-none rounded-sm border border-gray-200 px-2 py-1 shadow-xs"
      />
      <div v-if="form.errors.name" class="mt-2 text-sm text-red-600">{{ form.errors.name }}</div>
    </div>
    <div>
      <label class="block" for="company">Company:</label>
      <input
        type="text"
        v-model="form.company"
        id="company"
        class="mt-1 w-full appearance-none rounded-sm border border-gray-200 px-2 py-1 shadow-xs"
      />
      <div v-if="form.errors.company" class="mt-2 text-sm text-red-600">{{ form.errors.company }}</div>
    </div>
    <div>
      <label class="block" for="role">Role:</label>
      <select
        v-model="form.role"
        id="role"
        class="mt-1 w-full appearance-none rounded-sm border border-gray-200 px-2 py-1 shadow-xs"
      >
        <option></option>
        <option>User</option>
        <option>Admin</option>
        <option>Super</option>
      </select>
      <div v-if="form.errors.role" class="mt-2 text-sm text-red-600">{{ form.errors.role }}</div>
    </div>
    <div class="flex gap-4">
      <button type="submit" :disabled="form.processing" class="rounded-sm bg-slate-800 px-6 py-2 text-white">
        Submit
      </button>
      <button type="button" @click="form.reset()">Reset</button>
    </div>
  </form>
</template>
