<script setup lang="ts">
import { router } from '@inertiajs/vue3'

defineProps<{
  page: number
  timestamp: number
}>()

const prefetchPage2 = () => {
  router.prefetch('/prefetch/preserve-state', { method: 'get', data: { page: 2 } }, { cacheFor: '30s' })
}

const loadPage2WithoutPreserveState = () => {
  router.get('/prefetch/preserve-state', { page: 2 }, { preserveState: false })
}

const loadPage2WithPreserveState = () => {
  router.get('/prefetch/preserve-state', { page: 2 }, { preserveState: true })
}
</script>

<template>
  <div>
    <div>Current Page: {{ page }}</div>
    <div>Timestamp: {{ timestamp }}</div>

    <h3>Prefetch:</h3>
    <button @click="prefetchPage2">Prefetch Page 2</button>

    <h3>Load (should use cache if prefetched):</h3>
    <button @click="loadPage2WithoutPreserveState">Load Page 2 (preserveState: false)</button>
    <button @click="loadPage2WithPreserveState">Load Page 2 (preserveState: true)</button>
  </div>
</template>
