<script setup lang="ts">
import { Link, router } from '@inertiajs/vue3'

defineProps<{ name: string; next: string }>()

const prefetchPanel = () => {
  router.prefetch('/layers/panel/first', {}, { cacheFor: '30s' })
}

const openPanelInstantly = () => {
  router.visit('/layers/panel/first', { component: 'Layers/Panel' })
}
</script>

<template>
  <div id="waypoint">Waypoint {{ name }}</div>

  <Link :href="`/layers/waypoint/${next}`">Go to the next waypoint</Link>

  <button @click="prefetchPanel">Prefetch the panel</button>
  <button @click="openPanelInstantly">Instantly open the panel</button>
</template>
