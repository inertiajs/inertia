<script setup lang="ts">
import { useHttp } from '@inertiajs/vue3'
import { computed, ref, watch } from 'vue'

interface SearchResponse {
  items: string[]
  total: number
  query: string | null
}

const http = useHttp<{ query: string }, SearchResponse>({ query: '' })

const renderCount = ref(0)
const result = ref<SearchResponse | null>(null)

const fetchData = computed(() => {
  return () => http.get('/api/data')
})

watch(
  fetchData,
  async (fn) => {
    renderCount.value++
    try {
      result.value = await fn()
    } catch {
      // ignore
    }
  },
  { immediate: true },
)
</script>

<template>
  <div>
    <h1>useHttp Stable Reference Test</h1>
    <div id="render-count">Render count: {{ renderCount }}</div>
    <div v-if="result" id="result">Items: {{ result.items.join(', ') }}</div>
  </div>
</template>
