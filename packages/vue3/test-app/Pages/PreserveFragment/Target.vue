<script setup lang="ts">
import { usePage } from '@inertiajs/vue3'

const page = usePage()
</script>

<template>
  <div>
    <span id="current-url">{{ page.url }}</span>
    <span id="target-text">This is the target page</span>
  </div>
</template>
