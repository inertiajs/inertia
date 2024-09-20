<script setup lang="ts">
import { Deferred } from '@inertiajs/vue3'

defineProps<{
  baz?: string
  qux?: string
}>()
</script>

<template>
  <Deferred data="baz">
    <template #fallback>
      <div>Loading baz...</div>
    </template>
    {{ baz }}
  </Deferred>

  <Deferred data="qux">
    <template #fallback>
      <div>Loading qux...</div>
    </template>
    {{ qux }}
  </Deferred>

  <Deferred :data="['baz', 'qux']">
    <template #fallback>
      <div>Loading baz and qux...</div>
    </template>
    both {{ baz }} and {{ qux }}
  </Deferred>
</template>
