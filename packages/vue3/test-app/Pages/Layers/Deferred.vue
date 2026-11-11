<script setup lang="ts">
import { Deferred } from '@inertiajs/vue3'

defineProps<{ name: string; stats?: number[] }>()
</script>

<template>
  <div>Deferred layer: {{ name }}</div>

  <Deferred data="stats">
    <template #fallback>
      <div data-testid="deferred-fallback">Loading stats...</div>
    </template>
    <template #default>
      <div data-testid="deferred-stats">{{ stats?.join(',') }}</div>
    </template>
  </Deferred>
</template>
