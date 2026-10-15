<script setup lang="ts">
import { Link } from '@inertiajs/vue3'

defineProps<{
  term: string | null
}>()
</script>

<template>
  <div>
    <p id="results">Results for: {{ term ?? 'nothing' }}</p>

    <Link method="query" href="/prefetch/query" :data="{ term: 'apple' }" prefetch>Search Apple</Link>
    <Link method="query" href="/prefetch/query" :data="{ term: 'banana' }" prefetch>Search Banana</Link>
  </div>
</template>
