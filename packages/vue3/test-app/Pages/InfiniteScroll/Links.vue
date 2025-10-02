<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
</script>

<template>
  <div>
    <Link href="/infinite-scroll-with-link">Go to InfiniteScrollWithLink</Link>
    <Link href="/infinite-scroll-with-link" prefetch>Go to InfiniteScrollWithLink (Prefetch)</Link>
  </div>
</template>
