<script lang="ts">
import Layout from '../Components/Layout.vue'
export default { layout: Layout }
</script>

<script setup lang="ts">
import { Head, InfiniteScroll } from '@inertiajs/vue3'

defineProps<{
  buffer: number
  container: boolean
  users: {
    data: {
      id: number
      name: string
    }[]
  }
}>()
</script>

<template>
  <Head title="Infinite Scrolling" />

  <div :class="container ? 'h-96 overflow-y-auto border border-gray-300 p-4' : ''">
    <InfiniteScroll data="users" class="grid grid-cols-3 gap-4" trigger="both" :buffer="buffer">
      <div v-for="user in users.data" :key="user.id" class="border p-4">{{ user.id }} - {{ user.name }}</div>

      <template #header="{ fetch, loading, pagination, autoMode }">
        <div v-if="autoMode && loading" class="col-span-3 text-center text-gray-500">Loading...</div>

        <button
          @click="fetch"
          class="col-span-3 rounded-lg bg-gray-200 px-4 py-2 hover:bg-gray-300"
          :disabled="loading"
          :class="{ 'cursor-not-allowed opacity-50': loading }"
          v-if="!autoMode && pagination.hasPreviousPage"
        >
          Load previous items
        </button>
      </template>

      <template #footer="{ fetch, loading, pagination }">
        <button
          @click="fetch"
          class="col-span-3 rounded-lg bg-gray-200 px-4 py-2 hover:bg-gray-300"
          :disabled="loading"
          :class="{ 'cursor-not-allowed opacity-50': loading }"
          v-if="pagination.hasNextPage"
        >
          Load more items
        </button>
      </template>

      <template #loading>
        <div class="col-span-3 text-center text-gray-500">Loading...</div>
      </template>
    </InfiniteScroll>
  </div>
</template>
