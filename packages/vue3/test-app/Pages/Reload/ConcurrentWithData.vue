<script setup lang="ts">
import { router } from '@inertiajs/vue3'

defineProps<{
  foo?: string
  bar?: string
  timeframe?: string
}>()

function reloadBothPropsWithData() {
  router.reload({ only: ['foo'], data: { timeframe: 'week' } })
  setTimeout(() => router.reload({ only: ['bar'], data: { timeframe: 'week' } }), 50)
}
</script>

<template>
  <div>
    <div id="foo">Foo: {{ foo }}</div>
    <div id="bar">Bar: {{ bar }}</div>
    <div id="timeframe">Timeframe: {{ timeframe }}</div>

    <button @click="reloadBothPropsWithData">Reload both props with data</button>
  </div>
</template>
