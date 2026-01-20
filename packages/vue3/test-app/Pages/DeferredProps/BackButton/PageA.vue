<script setup lang="ts">
import { Deferred, Link } from '@inertiajs/vue3'

defineProps<{
  fastProp?: string
  slowProp?: string
}>()
</script>

<template>
  <Deferred data="fastProp">
    <template #fallback>
      <div>Loading fast prop...</div>
    </template>
    {{ fastProp }}
  </Deferred>

  <Deferred data="slowProp">
    <template #fallback>
      <div>Loading slow prop...</div>
    </template>
    {{ slowProp }}
  </Deferred>

  <Link href="/deferred-props/back-button/b">Go to Page B</Link>
</template>
