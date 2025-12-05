<script setup lang="ts">
import { usePage } from '@inertiajs/vue3'

const page = usePage()
</script>

<template>
  <div>
    <span id="flash">{{ page.flash ? JSON.stringify(page.flash) : 'no-flash' }}</span>
  </div>
</template>
