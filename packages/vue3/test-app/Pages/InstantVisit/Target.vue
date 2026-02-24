<script setup lang="ts">
defineProps<{
  greeting?: string
  timestamp?: number
  auth?: { user: string }
}>()
</script>

<template>
  <div>
    <div id="target">This is Target</div>
    <div id="greeting">Greeting: {{ greeting ?? 'none' }}</div>
    <div id="timestamp">Timestamp: {{ timestamp ?? 'none' }}</div>
    <div id="auth">Auth: {{ auth?.user ?? 'none' }}</div>
  </div>
</template>
