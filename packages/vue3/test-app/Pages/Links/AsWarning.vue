<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import type { Method } from '@inertiajs/core'

defineProps<{
  method: Method
}>()
</script>

<template>
  <div>
    <span class="text">This is the links page that demonstrates inertia-links with an 'as' warning</span>

    <Link :method="method" href="/example" class="get">{{ method }} Link</Link>
  </div>
</template>
