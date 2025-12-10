<script setup lang="ts">
import { Link, router } from '@inertiajs/vue3'

defineProps<{ foo: string; bar: string }>()
</script>

<template>
  <p id="foo">Foo: {{ foo }}</p>
  <p id="bar">Bar: {{ bar }}</p>
  <Link href="/once-props/partial-reload/b">Go to Partial Reload B</Link>
  <button @click="router.reload({ only: ['foo'] })">Reload (only foo)</button>
</template>
