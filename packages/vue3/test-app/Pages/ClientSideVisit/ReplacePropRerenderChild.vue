<script setup lang="ts">
import { onUpdated, ref } from 'vue'

defineProps<{ prefix: string; item: { label: string } }>()

const renderCount = ref(1)

onUpdated(() => {
  renderCount.value++
})
</script>

<template>
  <div>
    <div :id="`${prefix}-render-count`">Render count: {{ renderCount }}</div>
    <div :id="`${prefix}-value`">Value: {{ item.label }}</div>
  </div>
</template>
