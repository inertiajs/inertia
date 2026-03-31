<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<template>
  <div>
    <slot />
  </div>
</template>
