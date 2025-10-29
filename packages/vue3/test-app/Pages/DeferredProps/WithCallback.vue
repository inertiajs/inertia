<script setup lang="ts">
import { Deferred, Link } from '@inertiajs/vue3'

defineProps<{
  foo?: { text: string }
  bar?: { text: string }
}>()
</script>

<template>
  <Deferred data="foo">
    <template #default="{ loading }">
      <div v-if="loading">Loading foo (callback)...</div>
      <div v-else>{{ foo?.text }}</div>
    </template>
  </Deferred>

  <Deferred data="bar">
    <template #default="{ loading }">
      <div v-if="loading">Loading bar (callback)...</div>
      <div v-else>{{ bar?.text }}</div>
    </template>
  </Deferred>

  <Link href="/deferred-props/page-1">Page 1</Link>
  <Link href="/deferred-props/page-2">Page 2</Link>
</template>
