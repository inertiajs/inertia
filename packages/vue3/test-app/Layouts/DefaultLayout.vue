<script setup lang="ts">
defineProps<{ baseChrome?: string; layerChrome?: string; name?: string }>()
</script>

<template>
  <div id="default-layout">
    <span>Default Layout</span>
    <div id="base-chrome">{{ baseChrome ?? '' }}</div>
    <div id="layer-chrome">{{ layerChrome ?? '' }}</div>
    <div id="layout-name">{{ name ?? '' }}</div>
    <slot />
  </div>
</template>
