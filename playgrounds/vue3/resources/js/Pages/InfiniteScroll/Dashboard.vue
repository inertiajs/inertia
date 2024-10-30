<script lang="ts">
import Layout from '../../Components/InfiniteScrollLayout.vue'
export default { layout: Layout }
</script>

<script setup lang="ts">
import { Head, InfiniteScroll, InfiniteScrollProp } from '@inertiajs/vue3'

const props = defineProps<{
  items?: InfiniteScrollProp<{
    id: number
    level: string
    message: string
    created_at: string
    updated_at: string
  }>
  users?: InfiniteScrollProp<{
    id: number
    name: string
    created_at: string
    updated_at: string
  }>
}>()
</script>

<template>
  <Head title="Browse Logs + Users" />
  <h1 class="text-3xl">Browse Logs + Users</h1>
  <div class="flex space-x-12">
    <div class="relative flex-1 max-w-2xl mt-6 overflow-auto border-4 border-gray-200 rounded-lg h-96">
      <table class="w-full text-left">
        <thead>
          <tr class="sticky top-0 bg-white shadow">
            <th class="px-4 py-2">Level</th>
            <th class="px-4 py-2">Message</th>
          </tr>
        </thead>
        <tbody>
          <InfiniteScroll prop="items" preserve-url>
            <template v-if="items">
              <tr v-for="item in items.data" :key="item.id" class="border-b">
                <td class="px-4 py-2 text-teal-600 uppercase">{{ item.level }}</td>
                <td class="px-4 py-2">{{ item.message }}</td>
              </tr>
            </template>

            <template #fetching>
              <tr>
                <td class="px-4 py-2 text-center bg-gray-200" colspan="3">Fetching more items...</td>
              </tr>
            </template>
          </InfiniteScroll>
        </tbody>
      </table>
    </div>
    <div class="flex-1 max-w-2xl mt-6 overflow-auto border-4 border-gray-200 rounded-lg h-96">
      <table class="w-full text-left">
        <thead>
          <tr class="sticky top-0 bg-white shadow">
            <th class="px-4 py-2">Name</th>
          </tr>
        </thead>
        <tbody>
          <InfiniteScroll prop="users" preserve-url>
            <template v-if="users">
              <tr v-for="user in users.data" :key="user.id" class="border-b">
                <td class="px-4 py-2 text-teal-600 uppercase">{{ user.name }}</td>
              </tr>
            </template>

            <template #fetching>
              <tr>
                <td class="px-4 py-2 text-center bg-gray-200" colspan="2">Fetching more users...</td>
              </tr>
            </template>
          </InfiniteScroll>
        </tbody>
      </table>
    </div>
  </div>
</template>
