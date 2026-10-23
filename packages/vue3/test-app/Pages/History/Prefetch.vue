<script setup lang="ts">
import { Link } from '@inertiajs/vue3'

defineProps<{ page: string; loadedAt: number }>()
</script>

<template>
  <Link href="/history/prefetch/dashboard" prefetch cache-for="1m">Dashboard</Link>
  <Link href="/history/prefetch/reports" prefetch cache-for="1m">Reports</Link>
  <Link href="/history/prefetch/signed-out">Sign out</Link>

  <div>This is the {{ page }} page.</div>
  <div>Loaded at: {{ loadedAt }}</div>
</template>
