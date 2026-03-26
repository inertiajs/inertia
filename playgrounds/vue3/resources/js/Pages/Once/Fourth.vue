<script setup lang="ts">
import Layout from './Layout.vue'
import { Head } from '@inertiajs/vue3'

defineOptions({ layout: Layout })

defineProps<{
  foo: string
  bar: string
  baz4: string
  qux?: string
}>()
</script>

<template>
  <Head title="Once Props: Fourth Page" />
  <h1 class="text-3xl">Once Props: Fourth Page</h1>
  <p>Foo: {{ foo }}</p>
  <p>Bar: {{ bar }}</p>
  <p>Baz: {{ baz4 }}</p>
  <p>Qux: {{ qux ?? 'Loading...' }}</p>
</template>
