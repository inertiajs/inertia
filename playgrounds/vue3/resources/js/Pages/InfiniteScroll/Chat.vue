<script lang="ts">
import Layout from '../../Components/InfiniteScrollLayout.vue'
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
  <div class="mt-6 h-96 w-full max-w-2xl space-y-4 overflow-hidden rounded-lg border-4 border-gray-200">
    <div class="h-full w-full space-y-4 overflow-auto p-6">
      <InfiniteScroll prop="messages" trigger="start" auto-scroll preserve-url>
        <div
          v-for="message in sortedMessages"
          :key="message.id"
          :class="{
            'text-right': message.from === 'Joe',
          }"
        >
          <div
            class="relative inline-block rounded-lg p-2"
            :class="{
              'text-right': message.from === 'Joe',
              'bg-sky-100': message.from === 'Joe',
              'bg-gray-100': message.from !== 'Joe',
            }"
          >
            <div
              class="text-sm uppercase"
              :class="{
                'text-sky-600': message.from === 'Joe',
                'text-gray-800': message.from !== 'Joe',
              }"
            >
              {{ message.from }}
            </div>
            <div>{{ message.body }}</div>
          </div>
        </div>

        <template #fetching>
          <div class="bg-gray-200 px-4 py-2 text-center">Fetching more messages...</div>
        </template>
      </InfiniteScroll>
    </div>
  </div>
</template>
