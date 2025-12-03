<script setup lang="ts">
import { Deferred, Link } from '@inertiajs/vue3'

defineProps<{
  foo?: { text: string }
  bar: string
}>()
</script>

<template>
  <Deferred data="foo">
    <template #fallback>
      <div>Loading foo...</div>
    </template>

    <p id="foo">Foo: {{ foo?.text }}</p>
  </Deferred>

  <p id="bar">Bar: {{ bar }}</p>

  <Link href="/once-props/deferred/a">Go to Deferred Page A</Link>
</template>
