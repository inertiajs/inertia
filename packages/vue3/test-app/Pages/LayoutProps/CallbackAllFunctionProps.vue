<script setup lang="ts">
import { Link } from '@inertiajs/vue3'

defineOptions({
  layout: () => ({
    formatTitle: (name: string) => `Profile: ${name}`,
    formatDate: (date: string) => new Date(date).toLocaleDateString(),
  }),
})
</script>

<template>
  <div>
    <h2>Callback All Function Props Page</h2>

    <nav>
      <Link href="/layout-props/basic">Go to Basic Page</Link>
    </nav>
  </div>
</template>
