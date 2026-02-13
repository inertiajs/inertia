<script setup lang="ts">
defineProps<{
  redirected: boolean
}>()
</script>

<template>
  <div>
    <div id="redirect-target">This is RedirectTarget</div>
    <div id="redirected">Redirected: {{ redirected }}</div>
  </div>
</template>
