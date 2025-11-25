<script setup lang="ts">
import { Link, router } from '@inertiajs/vue3'

defineProps<{ foo: string; bar: string }>()
</script>

<template>
  <p id="foo">Foo: {{ foo }}</p>
  <p id="bar">Bar: {{ bar }}</p>
  <Link href="/once-props/page-b">Go to Page B</Link>
  <Link href="/once-props/page-c">Go to Page C</Link>
  <button @click="router.reload({ only: ['foo'] })">Reload (only foo)</button>
</template>
