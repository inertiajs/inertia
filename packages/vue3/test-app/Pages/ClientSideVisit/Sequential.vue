<script setup lang="ts">
import { router } from '@inertiajs/vue3'

defineProps<{
  foo?: string
  bar?: string
}>()

const replaceSequentially = () => {
  router.replaceProp('foo', 'baz')
  router.replaceProp('bar', 'qux')
}
</script>

<template>
  <div>
    <p>Foo: {{ foo }}</p>
    <p>Bar: {{ bar }}</p>

    <button @click="replaceSequentially">Replace foo and bar sequentially</button>
  </div>
</template>
