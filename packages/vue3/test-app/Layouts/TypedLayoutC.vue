<script setup lang="ts">
defineProps<{
  active: boolean
}>()
</script>

<template>
  <div>
    <slot />
  </div>
</template>
