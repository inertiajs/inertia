<script setup lang="ts">
import { Link } from '@inertiajs/vue3'

defineProps<{
  navigatedTo: boolean
}>()
</script>

<template>
  <div>
    <h1 data-testid="ssr-title">SSR Page 2</h1>
    <p data-testid="navigated-status">Navigated: {{ navigatedTo }}</p>

    <Link href="/ssr/page1" data-testid="back-link">Go back</Link>
  </div>
</template>
