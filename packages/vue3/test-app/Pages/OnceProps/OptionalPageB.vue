<script setup lang="ts">
import { Link, router } from '@inertiajs/vue3'

defineProps<{ foo?: string; bar: string }>()
</script>

<template>
  <p id="foo">Foo: {{ foo ?? 'not loaded' }}</p>
  <p id="bar">Bar: {{ bar }}</p>
  <Link href="/once-props/optional/a">Go to Optional Page A</Link>
  <button @click="router.reload({ only: ['foo'] })">Load foo</button>
</template>
