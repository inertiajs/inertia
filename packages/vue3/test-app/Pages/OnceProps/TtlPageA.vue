<script setup lang="ts">
import { Link, router } from '@inertiajs/vue3'

defineProps<{ foo: string; bar: string }>()
</script>

<template>
  <p id="foo">Foo: {{ foo }}</p>
  <p id="bar">Bar: {{ bar }}</p>
  <Link href="/once-props/ttl/b">Go to TTL Page B</Link>
  <Link href="/once-props/ttl/c" prefetch="mount">Go to TTL Page C</Link>
  <button @click="router.reload({ only: ['foo'] })">Reload foo</button>
</template>
