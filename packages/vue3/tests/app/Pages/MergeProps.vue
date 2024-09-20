<script setup lang="ts">
import { router } from '@inertiajs/vue3'

defineProps<{
  foo: number[]
  bar: number[]
}>()

const reloadIt = () => {
  router.reload({
    only: ['foo'],
  })
}

const getFresh = () => {
  router.reload({
    reset: ['foo'],
  })
}
</script>

<template>
  <div>bar count is {{ bar.length }}</div>
  <div>foo count is {{ foo.length }}</div>
  <button @click="reloadIt">Reload</button>
  <button @click="getFresh">Get Fresh</button>
</template>
