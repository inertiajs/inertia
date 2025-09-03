<script setup lang="ts">
import { marked } from 'marked'

defineProps<{
  message: {
    id: number
    type: 'prompt' | 'response'
    content: string
  }
}>()
</script>

<template>
  <div
    class="flex w-full"
    :class="{
      'justify-end': message.type === 'prompt',
      'justify-start': message.type === 'response',
      'ml-auto': message.type === 'prompt',
      'mr-auto': message.type === 'response',
    }"
  >
    <div class="flex max-w-[80%] items-start" :class="{}">
      <!-- Message Content -->
      <div
        v-html="marked.parse(message.content)"
        class="prose min-w-0 flex-1 text-[15px] leading-relaxed"
        :class="{
          'rounded-xl bg-gray-800 px-4 py-2 text-white': message.type === 'prompt',
          'text-gray-800': message.type === 'response',
        }"
      />
    </div>
  </div>
</template>
