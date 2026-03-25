<script setup lang="ts">
import AppLayout from '@/Layouts/AppLayout.vue'
import ContentLayout from '@/Layouts/ContentLayout.vue'
import { Link } from '@inertiajs/vue3'

defineOptions({
  layout: {
    app: [AppLayout, { title: 'Named Layouts Page', showSidebar: true, theme: 'light' }],
    content: [ContentLayout, { padding: 'xl', maxWidth: '2xl' }],
  },
})
</script>

<template>
  <div>
    <h2>Named Layouts Page</h2>
    <p>This page uses named layouts with setLayoutProps.</p>
    <p>App layout should have sidebar visible and light theme.</p>
    <p>Content layout should have xl padding and 2xl maxWidth.</p>

    <nav>
      <Link href="/layout-props/basic">Go to Basic Page</Link>
    </nav>
  </div>
</template>
