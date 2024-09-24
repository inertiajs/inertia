<script setup lang="ts">
import { Deferred, Link } from '@inertiajs/vue3'

defineProps<{
  foo?: string
  bar?: string
}>()
</script>

<template>
  <Deferred data="foo">
    <template #fallback>
      <div>Loading foo...</div>
    </template>
    {{ foo }}
  </Deferred>

  <Deferred data="bar">
    <template #fallback>
      <div>Loading bar...</div>
    </template>
    {{ bar }}
  </Deferred>

  <Link href="/deferred-props/page-2">Page 2</Link>
</template>
