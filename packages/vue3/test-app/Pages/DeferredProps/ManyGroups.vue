<script setup lang="ts">
import { Deferred, Link } from '@inertiajs/vue3'

defineProps<{
  foo?: { text: string }
  bar?: { text: string }
  baz?: { text: string }
  qux?: { text: string }
  quux?: { text: string }
}>()
</script>

<template>
  <Deferred data="foo">
    <template #fallback>
      <div>Loading foo...</div>
    </template>
    <div>{{ foo?.text }}</div>
  </Deferred>

  <Deferred data="bar">
    <template #fallback>
      <div>Loading bar...</div>
    </template>
    <div>{{ bar?.text }}</div>
  </Deferred>

  <Deferred data="baz">
    <template #fallback>
      <div>Loading baz...</div>
    </template>
    <div>{{ baz?.text }}</div>
  </Deferred>

  <Deferred data="qux">
    <template #fallback>
      <div>Loading qux...</div>
    </template>
    <div>{{ qux?.text }}</div>
  </Deferred>

  <Deferred data="quux">
    <template #fallback>
      <div>Loading quux...</div>
    </template>
    <div>{{ quux?.text }}</div>
  </Deferred>

  <Link href="/deferred-props/page-1">Page 1</Link>
  <Link href="/deferred-props/page-2">Page 2</Link>
  <Link href="/deferred-props/many-groups">Many groups</Link>
</template>
