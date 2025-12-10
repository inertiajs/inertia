<script setup lang="ts">
import { Link } from '@inertiajs/vue3'

defineProps<{ foo: string; bar: string }>()
</script>

<template>
  <p id="foo">Foo: {{ foo }}</p>
  <p id="bar">Bar: {{ bar }}</p>
  <Link href="/once-props/partial-reload/a">Go to Partial Reload A</Link>
</template>
