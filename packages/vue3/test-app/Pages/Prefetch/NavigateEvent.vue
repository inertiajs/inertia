<script setup lang="ts">
import { Link, router } from '@inertiajs/vue3'
import { onMounted } from 'vue'

onMounted(() => {
  router.on('navigate', (event) => {
    console.log(String(event.detail.cached))
  })
})
</script>

<template>
  <Link href="/prefetch/navigate-event/cached" prefetch="mount">Prefetched Link</Link>
  <Link href="/prefetch/navigate-event/fresh">Regular Link</Link>
</template>
