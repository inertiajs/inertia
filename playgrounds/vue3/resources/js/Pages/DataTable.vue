<script lang="ts">
import Layout from '../Components/Layout.vue'
export default { layout: Layout }
</script>

<script setup lang="ts">
import { Head, InfiniteScroll } from '@inertiajs/vue3'
import Spinner from '../Components/Spinner.vue'

defineProps<{
  users: {
    data: {
      id: number
      name: string
    }[]
  }
}>()
</script>

<template>
  <Head title="Data Table" />

  <InfiniteScroll data="users" class="mx-auto max-w-7xl px-8" :buffer="3000" items-element="tbody">
    <div class="overflow-hidden rounded-2xl shadow ring-1 ring-gray-200">
      <table class="min-w-full">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">ID</th>
            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Name</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 bg-white">
          <tr v-for="user in users.data" :key="user.id" class="transition-colors hover:bg-gray-50">
            <td class="px-6 py-4 text-sm text-gray-700">{{ user.id }}</td>
            <td class="px-6 py-4 text-sm text-gray-700">{{ user.name }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <template #loading>
      <div class="flex justify-center py-16">
        <Spinner class="size-6 text-gray-400" />
      </div>
    </template>
  </InfiniteScroll>
</template>
