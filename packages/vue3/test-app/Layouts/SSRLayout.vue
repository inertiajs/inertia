<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    title?: string
  }>(),
  {
    title: 'Default Title',
  },
)
</script>

<template>
  <div class="ssr-layout">
    <h1 data-testid="layout-title">{{ props.title }}</h1>
    <slot />
  </div>
</template>
