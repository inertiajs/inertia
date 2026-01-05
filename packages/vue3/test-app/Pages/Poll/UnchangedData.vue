<script setup lang="ts">
import { usePoll } from '@inertiajs/vue3'
import { onMounted, ref } from 'vue'

const replaceStateCalls = ref(0)
const pollsFinished = ref(0)

onMounted(() => {
  const original = window.history.replaceState.bind(window.history)
  window.history.replaceState = function (...args) {
    replaceStateCalls.value++
    return original(...args)
  }
})

usePoll(500, {
  only: ['custom_prop'],
  onFinish: () => pollsFinished.value++,
})
</script>

<template>
  <div>
    <p>
      replaceState calls: <span class="replaceStateCalls">{{ replaceStateCalls }}</span>
    </p>
    <p>
      polls finished: <span class="pollsFinished">{{ pollsFinished }}</span>
    </p>
  </div>
</template>
