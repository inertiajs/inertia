<script setup lang="ts">
import { Link } from '@inertiajs/vue3'

defineProps<{
  foo: string
  count: number
  items: string[]
}>()
</script>

<template>
  <div>
    <h1>Unified Props Test</h1>
    <p id="foo">Foo: {{ foo }}</p>
    <p id="count">Count: {{ count }}</p>
    <p id="items">Items: {{ items.join(', ') }}</p>
    <Link href="/unified/navigate">Navigate</Link>
  </div>
</template>
