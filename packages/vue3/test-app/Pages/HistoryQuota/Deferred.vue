<script setup lang="ts">
import { Deferred } from '@inertiajs/vue3'

defineProps<{
  largeData?: string
}>()
</script>

<template>
  <div>
    <h1>History Quota Test - Deferred</h1>

    <Deferred data="largeData">
      <template #fallback>
        <p>Loading large data...</p>
      </template>
      <p>Data size: {{ largeData?.length?.toLocaleString() }} bytes</p>
    </Deferred>
  </div>
</template>
