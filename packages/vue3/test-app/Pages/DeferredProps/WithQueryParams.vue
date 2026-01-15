<script setup lang="ts">
import { Deferred } from '@inertiajs/vue3'

defineProps<{
  filter: string
  users?: { text: string }
}>()
</script>

<template>
  <div>Filter: {{ filter }}</div>

  <Deferred data="users">
    <template #fallback>
      <div>Loading users...</div>
    </template>
    <div>{{ users?.text }}</div>
  </Deferred>
</template>
