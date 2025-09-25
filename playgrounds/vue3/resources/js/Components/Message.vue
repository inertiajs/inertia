<script setup lang="ts">
import { marked } from 'marked'
import { computed } from 'vue'

export type Message = {
  id: number | 'pending'
  type: 'prompt' | 'response'
  content: string
}

const props = defineProps<{
  message: Message
}>()

const htmlContent = computed(() => marked(props.message.content))
</script>

<template>
  <div
    class="flex w-full"
    :class="{
      'ml-auto justify-end': message.type === 'prompt',
      'mr-auto justify-start': message.type === 'response',
    }"
  >
    <div class="flex max-w-[80%] items-start">
      <div
        v-html="htmlContent"
        class="prose min-w-0 flex-1 text-[15px] leading-relaxed"
        :class="{
          'rounded-xl bg-gray-800 px-4 py-2 text-white': message.type === 'prompt',
          'text-gray-800': message.type === 'response',
        }"
      />
    </div>
  </div>
</template>
