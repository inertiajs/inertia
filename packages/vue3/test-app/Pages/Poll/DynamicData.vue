<script setup lang="ts">
import { router, usePoll } from '@inertiajs/vue3'

const props = defineProps<{
  counter: number
  last_received: number | null
}>()

usePoll(300, () => ({
  data: { counter_seen: props.counter },
  only: ['last_received'],
}))
</script>

<template>
  <div id="counter">counter: {{ counter }}</div>
  <div id="last_received">received: {{ last_received ?? 'null' }}</div>
  <button @click="router.reload({ only: ['counter'], data: { bump: counter + 1 } })">Increment</button>
</template>
