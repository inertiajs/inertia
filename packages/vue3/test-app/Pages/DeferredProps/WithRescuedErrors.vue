<script setup lang="ts">
import { Deferred, router } from '@inertiajs/vue3'

defineProps<{
  foo?: { text: string } | null
}>()

const retry = () => {
  router.reload({ only: ['foo'] })
}
</script>

<template>
  <Deferred data="foo">
    <template #fallback>
      <div>Loading foo...</div>
    </template>

    <template #error>
      <div id="foo-error">Unable to load foo.</div>
    </template>

    <div id="foo">{{ foo?.text }}</div>
  </Deferred>

  <button type="button" @click="retry">Retry</button>
</template>
