<script setup lang="ts">
import { Deferred } from '@inertiajs/vue3'

defineProps<{
  title?: string
  heavyData?: string
}>()
</script>

<template>
  <div>
    <div id="deferred">This is Deferred</div>
    <div id="title">Title: {{ title ?? 'none' }}</div>

    <Deferred data="heavyData">
      <template #fallback>
        <div id="heavy-loading">Loading heavy data...</div>
      </template>

      <div id="heavy-data">Heavy: {{ heavyData }}</div>
    </Deferred>
  </div>
</template>
