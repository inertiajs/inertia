<script setup lang="ts">
import { router } from '@inertiajs/vue3'

defineProps<{
  rows: { name: string; stats?: string }[]
  tags: string[]
}>()
</script>

<template>
  <p id="rows">{{ JSON.stringify(rows) }}</p>
  <p id="tags">{{ JSON.stringify(tags) }}</p>

  <button @click="router.reload({ only: ['rows', 'rows.0.stats'] })">Reload rows</button>
  <button @click="router.reload({ only: ['tags.1'] })">Reload second tag</button>
</template>
