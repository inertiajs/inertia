<script setup>
import { Link } from '@inertiajs/vue3'

defineProps({
  method: String,
})
</script>

<template>
  <div>
    <span class="text">This is the links page that demonstrates inertia-links with an 'as' warning</span>

    <Link :method="method" href="/example" class="get">{{ method }} Link</Link>
  </div>
</template>
