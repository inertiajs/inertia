<script setup lang="ts">
import { Deferred, Link } from '@inertiajs/vue3'

defineProps<{
  foo?: string
  bar: string
}>()
</script>

<template>
  <Deferred data="foo">
    <template #fallback>
      <div id="foo-loading">Loading foo...</div>
    </template>

    <p id="foo">Foo: {{ foo }}</p>
  </Deferred>

  <p id="bar">Bar: {{ bar }}</p>

  <Link href="/once-props/slow-deferred/a">Go to Page A</Link>
</template>
