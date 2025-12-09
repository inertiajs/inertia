<script setup lang="ts">
import { Link, router } from '@inertiajs/vue3'

defineProps<{ items: string[]; bar: string }>()
</script>

<template>
  <p id="items">Items count: {{ items.length }}</p>
  <p id="bar">Bar: {{ bar }}</p>
  <Link href="/once-props/merge/a">Go to Merge Page A</Link>
  <button @click="router.reload({ only: ['items'] })">Load more items</button>
</template>
