<script lang="ts">
import Layout from './Layout.vue'
export default { layout: Layout }
</script>

<script setup lang="ts">
import { Head } from '@inertiajs/vue3'

defineProps<{
  foo: string
  bar: string
  baz2: string
  qux?: string
}>()
</script>

<template>
  <Head title="Once Props: Second Page" />
  <h1 class="text-3xl">Once Props: Second Page</h1>
  <p>Foo: {{ foo }}</p>
  <p>Bar: {{ bar }}</p>
  <p>Baz: {{ baz2 }}</p>
  <p>Qux: {{ qux ?? 'Loading...' }}</p>
</template>
