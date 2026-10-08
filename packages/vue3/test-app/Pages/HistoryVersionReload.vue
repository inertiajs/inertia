<script setup lang="ts">
defineProps<{ deploy: string }>()
</script>

<template>
  <div id="deploy">{{ deploy }}</div>
</template>
