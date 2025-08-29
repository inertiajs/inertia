<script lang="ts">
import Layout from '../Components/Layout.vue'
export default { layout: Layout }
</script>

<script setup lang="ts">
import { Head, InfiniteScroll, router } from '@inertiajs/vue3'
import { default as axios } from 'axios'
import { computed, ref } from 'vue'

const props = defineProps<{
  buffer: number
  container: boolean
  messages: {
    data: {
      id: number
      message: string
    }[]
  }
}>()

const newMessage = ref('')

const postMessage = () => {
  axios
    .post('/messages', {
      message: newMessage.value,
    })
    .then((response) => {
      newMessage.value = ''
      router.replace({
        props: (currentProps) => {
          return {
            ...currentProps,
            messages: {
              ...currentProps.messages,
              data: [response.data, ...currentProps.messages.data],
            },
          }
        },
        preserveState: true,
        preserveScroll: true,
      })
    })
}

const reversedMessages = computed(() => {
  return [...props.messages.data].reverse()
})
</script>

<template>
  <Head title="Infinite Scrolling" />

  <div :class="container ? 'h-128 relative overflow-y-auto border-gray-300 p-4' : ''">
    <div class="bg-from-white bg-to-transparent absolute left-0 right-0 top-0 z-50 h-32 p-4"></div>
    <InfiniteScroll
      preserve-url
      reverse
      data="messages"
      class="grid grid-cols-1 gap-4"
      trigger="start"
      :buffer="buffer"
      scroll-behavior="smooth"
    >
      <div
        v-for="message in reversedMessages"
        :key="message.id"
        class="rounded-lg border border-gray-200 bg-gray-50 p-4"
      >
        <p class="text-sm text-gray-700">
          Message ID <b>{{ message.id }}</b>
        </p>
        <p class="mt-1 whitespace-pre-line">{{ message.message }}</p>
      </div>

      <template #header="{ fetch, loading, pagination, autoMode }">
        <div v-if="autoMode && loading" class="col-span-3 py-4 text-center text-gray-500">Loading...</div>

        <!-- <button
          @click="fetch"
          class="col-span-3 rounded-lg bg-gray-200 px-4 py-2 hover:bg-gray-300"
          :disabled="loading"
          :class="{ 'cursor-not-allowed opacity-50': loading }"
          v-if="!autoMode && pagination.hasPreviousPage"
        >
          Load previous items
        </button> -->
      </template>
      <!--
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
      </template> -->

      <!-- <template #loading>
        <div class="col-span-3 mb-4 text-center text-gray-500">Loading...</div>
      </template> -->
    </InfiniteScroll>
  </div>

  <form @submit.prevent="postMessage()">
    <textarea
      v-model="newMessage"
      name="message"
      class="mt-4 w-full rounded-lg border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
      rows="3"
      placeholder="Type a message..."
      required
    ></textarea>

    <button type="submit" class="mt-2 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Send</button>
  </form>
</template>
