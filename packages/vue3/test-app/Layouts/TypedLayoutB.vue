<script setup lang="ts">
defineProps<{
  count: number
}>()
</script>

<template>
  <div>
    <slot />
  </div>
</template>
