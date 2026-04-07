<script setup lang="ts">
import { Link } from '@inertiajs/vue3'

defineOptions({
  layout: () => ({ title: 'Function Prop Title', showSidebar: false, formatName: (name: string) => `Hello, ${name}` }),
})
</script>

<template>
  <div>
    <h2>Callback Function Prop Page</h2>

    <nav>
      <Link href="/layout-props/basic">Go to Basic Page</Link>
    </nav>
  </div>
</template>
