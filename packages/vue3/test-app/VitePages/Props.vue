<script setup lang="ts">
import { Link } from '@inertiajs/vue3'

defineProps<{
  foo: string
  count: number
  items: string[]
}>()
</script>

<template>
  <div>
    <h1 data-testid="props-title">Vite Props Page</h1>
    <p data-testid="foo">foo: {{ foo }}</p>
    <p data-testid="count">count: {{ count }}</p>
    <p data-testid="items">items: {{ items.join(', ') }}</p>
    <Link href="/auto" data-testid="home-link">Back to Home</Link>
  </div>
</template>
