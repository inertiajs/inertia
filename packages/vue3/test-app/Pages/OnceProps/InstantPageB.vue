<script setup lang="ts">
import { Deferred } from '@inertiajs/vue3'

defineProps<{ foo?: string; bar?: string }>()
</script>

<template>
  <Deferred data="foo">
    <template #fallback>
      <div>Loading foo...</div>
    </template>

    <p id="foo">Foo: {{ foo }}</p>
  </Deferred>

  <p id="bar">Bar: {{ bar }}</p>
</template>
