<script setup lang="ts">
import { router } from '@inertiajs/vue3'

defineProps<{
  foo?: string
  bar?: string
}>()

function reloadBothProps() {
  router.reload({ only: ['foo'] })
  setTimeout(() => router.reload({ only: ['bar'] }), 50)
}
</script>

<template>
  <div>
    <div id="foo">Foo: {{ foo }}</div>
    <div id="bar">Bar: {{ bar }}</div>

    <button @click="reloadBothProps">Reload both props</button>
  </div>
</template>
