<script setup lang="ts">
import { Link } from '@inertiajs/vue3'

defineProps<{ pageNumber: number }>()
</script>

<template>
  <Link href="/history/version/1">Page 1</Link>
  <Link href="/history/version/2">Page 2</Link>
</template>
