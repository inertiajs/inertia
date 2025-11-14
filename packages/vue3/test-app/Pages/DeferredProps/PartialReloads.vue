<script setup lang="ts">
import { Deferred, router } from '@inertiajs/vue3'

defineProps<{
  foo?: { timestamp: string }
  bar?: { timestamp: string }
}>()

const reloadOnlyFoo = () => {
  router.reload({
    only: ['foo'],
  })
}

const reloadOnlyBar = () => {
  router.reload({
    only: ['bar'],
  })
}

const reloadBoth = () => {
  router.reload({
    only: ['foo', 'bar'],
  })
}
</script>

<template>
  <Deferred data="foo">
    <template #fallback>
      <div>Loading foo...</div>
    </template>
    <div id="foo-timestamp">{{ foo?.timestamp }}</div>
  </Deferred>

  <Deferred data="bar">
    <template #fallback>
      <div>Loading bar...</div>
    </template>
    <div id="bar-timestamp">{{ bar?.timestamp }}</div>
  </Deferred>

  <button @click="reloadOnlyFoo">Reload foo only</button>
  <button @click="reloadOnlyBar">Reload bar only</button>
  <button @click="reloadBoth">Reload both</button>
</template>
