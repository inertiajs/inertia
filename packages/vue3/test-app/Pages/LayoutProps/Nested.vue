<script lang="ts">
import AppLayout from '@/Layouts/AppLayout.vue'
import ContentLayout from '@/Layouts/ContentLayout.vue'

export default {
  layout: [
    [AppLayout, { title: 'Nested Layouts', showSidebar: true }],
    [ContentLayout, { padding: 'lg' }],
  ],
  layoutProps: { theme: 'dark', maxWidth: 'xl' },
}
</script>

<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
</script>

<template>
  <div>
    <h2>Nested Layouts with Static Props</h2>
    <p>This page uses nested layouts with static props in tuple format.</p>
    <p>AppLayout: title="Nested Layouts", sidebar visible, theme="dark" (from layoutProps)</p>
    <p>ContentLayout: padding="lg" (static), maxWidth="xl" (from layoutProps)</p>

    <nav>
      <Link href="/layout-props/basic">Go to Basic Page</Link>
    </nav>
  </div>
</template>
