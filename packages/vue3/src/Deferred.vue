<script setup lang="ts">
defineProps<{
  data: any
}>()
</script>

<template>
  <slot name="loading" v-if="data === undefined" />
  <slot v-if="data !== undefined" />
</template>
