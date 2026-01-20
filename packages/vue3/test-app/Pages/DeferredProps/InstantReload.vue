<script setup lang="ts">
import { Deferred, router } from '@inertiajs/vue3'
import { onMounted } from 'vue'

defineProps<{
  foo?: { text: string }
  bar?: { text: string }
}>()

onMounted(() => {
  router.reload({
    only: ['foo'],
  })
})
</script>

<template>
  <Deferred data="foo">
    <template #fallback>
      <div>Loading foo...</div>
    </template>
    <div>{{ foo?.text }}</div>
  </Deferred>

  <Deferred data="bar">
    <template #fallback>
      <div>Loading bar...</div>
    </template>
    <div>{{ bar?.text }}</div>
  </Deferred>
</template>
