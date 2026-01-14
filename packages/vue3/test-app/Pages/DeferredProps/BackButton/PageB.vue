<script setup lang="ts">
import { Deferred, Link } from '@inertiajs/vue3'

defineProps<{
  data?: string
}>()
</script>

<template>
  <Deferred data="data">
    <template #fallback>
      <div>Loading data...</div>
    </template>
    {{ data }}
  </Deferred>

  <Link href="/deferred-props/back-button/a">Go to Page A</Link>
</template>
