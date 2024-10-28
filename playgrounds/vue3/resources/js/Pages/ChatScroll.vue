<script lang="ts">
import Layout from '../Components/Layout.vue'
export default { layout: Layout }
</script>

<script setup lang="ts">
import { Head, InfiniteScroll, InfiniteScrollProp } from '@inertiajs/vue3'
import { computed } from 'vue'

const props = defineProps<{
  messages: InfiniteScrollProp<{
    id: number
    from: string
    body: string
    created_at: string
    updated_at: string
  }>
}>()

const sortedMessages = computed(() => {
  return props.messages.data.sort((a, b) => {
    return a.created_at.localeCompare(b.created_at)
  })
})
</script>

<template>
  <Head title="Chat" />
  <h1 class="text-3xl">Chat</h1>
  <div class="mt-6 w-full max-w-2xl space-y-4 overflow-hidden rounded shadow-sm">
    <InfiniteScroll prop="messages" trigger="start" auto-scroll>
      <div v-for="message in sortedMessages" :key="message.id" class="relative rounded-lg bg-teal-100 p-2">
        <div class="absolute right-4 top-4 mb-2 whitespace-nowrap text-xs text-gray-400">
          {{ message.created_at.split('.').shift() }}
        </div>
        <div class="text-sm uppercase text-teal-600">{{ message.from }}:</div>
        <div class="">{{ message.body }}</div>
      </div>

      <template #fetching>
        <div class="bg-gray-200 px-4 py-2 text-center">Fetching more messages...</div>
      </template>
    </InfiniteScroll>
  </div>
</template>
