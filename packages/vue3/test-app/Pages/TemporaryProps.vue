<script setup lang="ts">
import { Link } from '@inertiajs/vue3'

defineProps<{
  regular?: number
  tmp?: number
}>()
</script>

<template>
  <div>regular is {{ regular ?? 'undefined' }}</div>
  <div>tmp is {{ tmp ?? 'undefined' }}</div>
  <Link href="/">homepage</Link>
</template>
