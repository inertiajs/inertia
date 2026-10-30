<script setup lang="ts">
import { Deferred, Link, router } from '@inertiajs/vue3'

defineProps<{
  term: string | null
  results?: string
  reloadedAt: number | null
}>()
</script>

<template>
  <div>
    <p id="term">Term: {{ term ?? 'nothing' }}</p>
    <p id="reloaded-at">Reloaded at: {{ reloadedAt ?? 'never' }}</p>

    <Deferred data="results">
      <template #fallback>
        <p>Loading results...</p>
      </template>

      <p id="results">{{ results }}</p>
    </Deferred>

    <Link method="query" href="/query-visits/search" :data="{ term: 'apple' }">Search Apple</Link>
    <Link method="query" href="/query-visits/search" :data="{ term: 'banana' }">Search Banana</Link>
    <button @click="router.reload({ only: ['reloadedAt'] })">Reload</button>
    <button @click="router.reload({ only: ['reloadedAt'], headers: { 'X-Slow': 'true' } })">Slow reload</button>
    <button @click="router.reload({ data: { term: 'cherry' } })">Reload with Cherry</button>
    <button @click="router.push({ url: '/query-visits/search-elsewhere' })">Push elsewhere</button>
    <Link href="/dump/get">Leave</Link>
  </div>
</template>
