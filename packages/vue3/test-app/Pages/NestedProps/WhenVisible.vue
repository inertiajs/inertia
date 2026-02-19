<script setup lang="ts">
import { WhenVisible } from '@inertiajs/vue3'

defineProps<{
  stats?: {
    visitors: number
  }
}>()
</script>

<template>
  <div style="margin-top: 2000px; padding: 20px">
    <WhenVisible data="stats.visitors">
      <template #fallback>
        <p id="loading">Loading visitors...</p>
      </template>

      <p id="visitors">Visitors: {{ stats?.visitors }}</p>
    </WhenVisible>
  </div>
</template>
