<script setup lang="ts">
import { Link } from '@inertiajs/vue3'

defineOptions({
  layout: { title: 'Static Object Title', showSidebar: false },
})
</script>

<template>
  <div>
    <h2>Static Object Layout Page</h2>

    <nav>
      <Link href="/layout-props/basic">Go to Basic Page</Link>
    </nav>
  </div>
</template>
