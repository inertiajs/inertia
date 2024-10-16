<script lang="ts">
import Layout from '../Components/Layout.vue'
export default { layout: Layout }
</script>

<script setup lang="ts">
import { Head, InfiniteScroll, InfiniteScrollProp, Link, useForm } from '@inertiajs/vue3'

const props = defineProps<{
  users: InfiniteScrollProp<{
    id: number
    name: string
    email: string
    email_verified_at: string
    created_at: string
    updated_at: string
  }>
  query?: string
}>()

const form = useForm({
  query: props.query,
})
</script>

<template>
  <Head title="Users Scroll" />
  <h1 class="text-3xl">Users!</h1>
  <ul class="flex mt-4 space-x-4">
    <li><Link href="/users-scroll/default">Default</Link></li>
    <li><Link href="/users-scroll/simple">Simple</Link></li>
    <li><Link href="/users-scroll/cursor">Cursor</Link></li>
  </ul>

  <form @submit.prevent="form.get('')" class="space-x-4">
    <input type="search" v-model="form.query" placeholder="Search for user" class="p-2 my-4 border border-black" />
    <button type="submit">Search</button>
  </form>

  <div class="w-full max-w-2xl mt-6 overflow-hidden border rounded shadow-sm">
    <table class="w-full text-left">
      <thead>
        <tr>
          <th class="px-4 py-2">Id</th>
          <th class="px-4 py-2">Name</th>
        </tr>
      </thead>
      <tbody>
        <InfiniteScroll prop="users">
          <tr v-for="user in users.data" :key="user.id" class="border-t">
            <td style="width: 75px" class="px-4 py-2">{{ user.id }}</td>
            <td class="px-4 py-2">{{ user.name }}</td>
          </tr>

          <template #fetching>
            <tr>
              <td class="px-4 py-2 text-center bg-gray-200" colspan="2">Fetching more users...</td>
            </tr>
          </template>
        </InfiniteScroll>
      </tbody>
    </table>
  </div>
</template>
