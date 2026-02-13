<script setup lang="ts">
defineProps<{
  greeting?: string
  timestamp?: number
}>()
</script>

<template>
  <div>
    <div id="target">This is Target</div>
    <div id="greeting">Greeting: {{ greeting ?? 'none' }}</div>
    <div id="timestamp">Timestamp: {{ timestamp ?? 'none' }}</div>
  </div>
</template>
