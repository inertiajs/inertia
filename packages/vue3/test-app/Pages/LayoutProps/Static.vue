<script setup lang="ts">
import AppLayout from '@/Layouts/AppLayout.vue'
import { Link } from '@inertiajs/vue3'

defineOptions({
  layout: [AppLayout, { title: 'Static Props Page', showSidebar: false, theme: 'dark' }],
})
</script>

<template>
  <div>
    <h2>Static Layout Props Page</h2>
    <p>This page uses static props defined in the layout tuple.</p>
    <p>The title should be "Static Props Page", sidebar should be hidden, theme should be "dark".</p>

    <nav>
      <Link href="/layout-props/basic">Go to Basic Page</Link>
    </nav>
  </div>
</template>
