<script setup lang="ts">
import { Deferred } from '@inertiajs/vue3'

defineProps<{
  alpha?: string
  beta?: string
}>()
</script>

<template>
  <Deferred data="alpha">
    <template #fallback>
      <div>Loading alpha...</div>
    </template>
    {{ alpha }}
  </Deferred>

  <Deferred data="beta">
    <template #fallback>
      <div>Loading beta...</div>
    </template>
    {{ beta }}
  </Deferred>
</template>
