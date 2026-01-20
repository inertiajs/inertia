<script setup lang="ts">
import { Deferred, router } from '@inertiajs/vue3'

defineProps<{
  results?: { data: string[]; page: number }
}>()

const handleReload = () => {
  router.reload({
    data: { page: 2 },
  })
}
</script>

<template>
  <Deferred data="results">
    <template #fallback>
      <div>Loading results...</div>
    </template>
    <div id="results-data">{{ results?.data?.join(', ') }}</div>
    <div id="results-page">Page: {{ results?.page }}</div>
  </Deferred>

  <button @click="handleReload">Reload with page 2</button>
</template>
