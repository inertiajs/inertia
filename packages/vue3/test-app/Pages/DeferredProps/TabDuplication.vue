<script setup lang="ts">
import { Deferred } from '@inertiajs/vue3'

defineProps<{ message?: string }>()
</script>

<template>
  <Deferred data="message">
    <template #fallback>
      <div id="fallback">Loading message...</div>
    </template>
    <div id="message">{{ message }}</div>
  </Deferred>
</template>
