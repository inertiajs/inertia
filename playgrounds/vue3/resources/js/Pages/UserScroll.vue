<script lang="ts">
import Layout from '../Components/Layout.vue'
export default { layout: Layout }
</script>

<script setup lang="ts">
import { Head, WhenVisible } from '@inertiajs/vue3'

const props = defineProps<{
  users: {
    id: number
    name: string
    email: string
    email_verified_at: string
    created_at: string
    updated_at: string
  }[]
  page: number
  is_last_page: boolean
}>()
</script>

<template>
  <Head title="Users Scroll" />
  <h1 class="text-3xl">Users!</h1>

  <div class="mt-6 w-full max-w-2xl overflow-hidden rounded border shadow-sm">
    <table class="w-full text-left">
      <thead>
        <tr>
          <th class="px-4 py-2">Id</th>
          <th class="px-4 py-2">Name</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id" class="border-t">
          <td class="px-4 py-2">{{ user.id }}</td>
          <td class="px-4 py-2">{{ user.name }}</td>
        </tr>
      </tbody>
    </table>

    <WhenVisible
      :buffer="200"
      always
      :params="{
        data: {
          page: page + 1,
        },
        only: ['users', 'page', 'is_last_page'],
        preserveUrl: true,
      }"
    >
      <template #fallback>
        <div v-if="!is_last_page" class="bg-gray-100 p-4 text-center">Fetching more users...</div>
      </template>

      <div v-if="!is_last_page" class="bg-gray-100 p-4 text-center">Fetching more users...</div>
    </WhenVisible>
  </div>
</template>
