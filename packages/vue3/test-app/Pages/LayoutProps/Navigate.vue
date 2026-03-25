<script setup lang="ts">
import AppLayout from '@/Layouts/AppLayout.vue'
import { Link } from '@inertiajs/vue3'

defineOptions({
  layout: [AppLayout, { title: 'Navigate Page', showSidebar: false, theme: 'dark' }],
})
</script>

<template>
  <div>
    <h2>Navigate Page</h2>
    <p>This page sets different layout props to test reset on navigation.</p>
    <p>Title should be "Navigate Page", sidebar hidden, theme dark.</p>

    <nav>
      <Link href="/layout-props/basic">Go to Basic Page (props should reset)</Link>
    </nav>
  </div>
</template>
