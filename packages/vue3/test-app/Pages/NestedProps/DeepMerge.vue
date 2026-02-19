<script setup lang="ts">
import { router } from '@inertiajs/vue3'

defineProps<{
  data: {
    items: { id: number; name: string }[]
    label: string
  }
}>()

const loadMore = () => {
  router.reload({
    only: ['data'],
    data: { page: 2 },
  })
}
</script>

<template>
  <p id="items">{{ data.items.map((i) => i.name).join(', ') }}</p>
  <p id="label">Label: {{ data.label }}</p>
  <button @click="loadMore">Load More</button>
</template>
