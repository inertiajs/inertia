<script setup lang="ts">
defineProps<{ note: string; errors: Record<string, string> }>()
</script>

<template>
  <div>Local layer</div>
  <div id="local-note">{{ note }}</div>
  <div id="local-errors">{{ typeof errors }}</div>
</template>
