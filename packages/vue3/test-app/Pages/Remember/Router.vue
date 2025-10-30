<script setup lang="ts">
import { router } from '@inertiajs/vue3'
import { ref } from 'vue'

const foo = ref('-')
const bar = ref(0)

function remember() {
  router.remember('foo')
  router.remember(42, 'bar')
}

function restore() {
  foo.value = router.restore() ?? '-'
  bar.value = router.restore('bar') ?? 0
}

function restoreTyped() {
  const fooValue = router.restore<string>()
  const barValue = router.restore<number>('bar')

  fooValue?.startsWith('f')
  barValue?.toFixed(2)

  foo.value = fooValue ?? '-'
  bar.value = barValue ?? 0

  // @ts-expect-error - Testing type safety
  fooValue?.toFixed(2)
  // @ts-expect-error - Testing type safety
  barValue?.startsWith('b')
}
</script>

<template>
  <div>
    <p>Foo: {{ foo }}</p>
    <p>Bar: {{ bar }}</p>
    <button @click="remember">Remember</button>
    <button @click="restore">Restore</button>
    <button @click="restoreTyped">Restore Typed</button>
  </div>
</template>
