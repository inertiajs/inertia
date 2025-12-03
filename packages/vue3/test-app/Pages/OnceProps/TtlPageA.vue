<script setup lang="ts">
import { Link } from '@inertiajs/vue3'

defineProps<{ foo: string; bar: string }>()
</script>

<template>
  <p id="foo">Foo: {{ foo }}</p>
  <p id="bar">Bar: {{ bar }}</p>
  <Link href="/once-props/ttl-page/b">Go to TTL Page B</Link>
</template>
