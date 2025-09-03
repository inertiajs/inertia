<script lang="ts">
import Layout from '../Components/Layout.vue'
export default { layout: (h, page) => h(Layout, { padding: false }, () => page) }
</script>

<script setup lang="ts">
import { Head, InfiniteScroll, router } from '@inertiajs/vue3'
import { useStream } from '@laravel/stream-vue'
import { computed, ref } from 'vue'
import ChatMessage from '../Components/ChatMessage.vue'
import PaperAirplaneIcon from '../Components/PaperAirplaneIcon.vue'
import Spinner from '../Components/Spinner.vue'
import StreamingIndicator from '../Components/StreamingIndicator.vue'
import Textarea from '../Components/Textarea.vue'

type Message = {
  id: number | 'pending'
  type: 'prompt' | 'response'
  content: string
}

const props = defineProps<{
  messages: {
    data: Message[]
  }
}>()

const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') as string

const scrollContainer = ref(null)

const requestCount = ref(0)
const newPrompt = ref('')
const pendingResponse = ref('')

const { isFetching, isStreaming, send } = useStream('messages', {
  csrfToken,
  onData: (data) => {
    pendingResponse.value += data
  },
  onFinish: () => {
    router.prependToProp('messages.data', {
      id: 0,
      content: pendingResponse.value,
      type: 'response',
    })

    pendingResponse.value = ''
  },
})

const canSendPrompt = computed(() => !!newPrompt.value.trim() && !isFetching.value && !isStreaming.value)

const sendMessage = () => {
  if (!canSendPrompt.value) {
    return
  }

  requestCount.value += 1

  router.prependToProp(
    'messages.data',
    {
      id: Date.now(),
      content: newPrompt.value,
      type: 'prompt',
    },
    {
      onSuccess: () => {
        scrollContainer.value?.scrollTo({ top: scrollContainer.value.scrollHeight, behavior: 'smooth' })

        send({ message: newPrompt.value })

        newPrompt.value = ''
      },
    },
  )
}

const reversedMessages = computed(() => {
  const messages = [...props.messages.data].reverse()

  if (pendingResponse.value) {
    // Append the pending response to the end of the reversed messages
    // until the stream is finished and the message is added properly
    messages.push({
      id: 'pending',
      content: pendingResponse.value,
      type: 'response',
    })
  }

  return messages
})

const isLastMessage = (message: Message) => {
  return message === reversedMessages.value[reversedMessages.value.length - 1]
}
</script>

<template>
  <Head title="AI Chat" />

  <div class="relative flex h-[calc(100vh-88px)] flex-col bg-gray-50">
    <div ref="scrollContainer" class="h-full flex-1 overflow-y-auto">
      <InfiniteScroll reverse bottom data="messages" class="mx-auto grid max-w-3xl gap-6 px-8 py-16" trigger="both">
        <div
          v-for="message in reversedMessages"
          :key="message.id"
          :class="{
            'min-h-[calc(100vh-88px-131px-64px)]': isLastMessage(message) && requestCount > 0,
          }"
        >
          <ChatMessage :message />
          <StreamingIndicator class="mt-6" v-if="isLastMessage(message) && isFetching" />
        </div>

        <template #loading="{ loadingBefore }">
          <div class="flex justify-center" :class="loadingBefore ? 'pt-16' : 'pb-16'">
            <Spinner class="size-6 text-gray-400" />
          </div>
        </template>
      </InfiniteScroll>
    </div>

    <div class="sticky bottom-0 border-t border-gray-200 bg-white px-8 py-6">
      <form
        @submit.prevent="sendMessage"
        class="relative mx-auto flex max-w-3xl items-end rounded-xl border border-gray-300 bg-white px-4 py-3 shadow-sm transition-colors focus-within:border-gray-400"
      >
        <Textarea
          v-model="newPrompt"
          placeholder="Type your message..."
          @keydown.enter.exact.prevent="sendMessage"
          @keydown.enter.shift.exact.prevent="newPrompt += '\n'"
        />

        <button
          type="submit"
          :disabled="!canSendPrompt"
          class="ml-3 flex size-8 items-center justify-center rounded-lg bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Spinner v-if="isFetching || isStreaming" class="size-4 text-white" />
          <PaperAirplaneIcon class="rotate-270 size-4 text-white" v-else />
        </button>
      </form>
    </div>
  </div>
</template>
