<script lang="ts">
import Layout from '../Components/Layout.vue'
export default { layout: Layout }
</script>

<script setup lang="ts">
import { Head, InfiniteScroll, InfiniteScrollProp } from '@inertiajs/vue3'
import { computed, onMounted } from 'vue'

const props = defineProps<{
  items: InfiniteScrollProp<{
    id: number
    level: string
    message: string
    created_at: string
    updated_at: string
  }>
}>()

onMounted(() => {
  const el = document.querySelector('.overflow-auto')

  if (el) {
    setTimeout(() => (el.scrollTop = el.scrollHeight * 0.25), 10)
  }
})

const sortedItems = computed(() => {
  return props.items.data.sort((a, b) => {
    return a.created_at.localeCompare(b.created_at)
  })
})
</script>

<template>
  <Head title="Browse Logs" />
  <h1 class="text-3xl">Browse Logs</h1>

  <div class="mt-6 h-96 max-w-2xl overflow-auto border border-black">
    <div class="mt-6 w-full max-w-2xl overflow-hidden rounded border shadow-sm">
      <table class="w-full text-left">
        <thead>
          <tr>
            <th class="px-4 py-2">Date</th>
            <th class="px-4 py-2">Level</th>
            <th class="px-4 py-2">Message</th>
          </tr>
        </thead>
        <tbody>
          <InfiniteScroll prop="items" trigger="both">
            <tr v-for="item in sortedItems" :key="item.id" class="border-t">
              <td class="whitespace-nowrap px-4 py-2 text-gray-400">[{{ item.created_at.split('.').shift() }}]</td>
              <td class="px-4 py-2 uppercase text-teal-600">{{ item.level }}</td>
              <td class="px-4 py-2">{{ item.message }}</td>
            </tr>

            <template #fetching>
              <tr>
                <td class="bg-gray-200 px-4 py-2 text-center" colspan="3">Fetching more items...</td>
              </tr>
            </template>
          </InfiniteScroll>
        </tbody>
      </table>
    </div>
  </div>
</template>
