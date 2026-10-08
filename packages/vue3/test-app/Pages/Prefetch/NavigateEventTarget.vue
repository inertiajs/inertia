<script setup lang="ts">
defineProps<{ label: string }>()
</script>

<template>
  <div>This is the {{ label }} target</div>
</template>
