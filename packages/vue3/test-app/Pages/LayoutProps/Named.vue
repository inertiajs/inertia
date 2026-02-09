<script lang="ts">
import AppLayout from '@/Layouts/AppLayout.vue'
import ContentLayout from '@/Layouts/ContentLayout.vue'

export default {
  layout: {
    app: AppLayout,
    content: ContentLayout,
  },
}
</script>

<script setup lang="ts">
import { Link, setLayoutProps, setLayoutPropsFor } from '@inertiajs/vue3'

setLayoutProps({
  title: 'Named Layouts Page',
})

setLayoutPropsFor('app', {
  showSidebar: true,
  theme: 'light',
})

setLayoutPropsFor('content', {
  padding: 'xl',
  maxWidth: '2xl',
})
</script>

<template>
  <div>
    <h2>Named Layouts Page</h2>
    <p>This page uses named layouts with setLayoutPropsFor.</p>
    <p>App layout should have sidebar visible and light theme.</p>
    <p>Content layout should have xl padding and 2xl maxWidth.</p>

    <nav>
      <Link href="/layout-props/basic">Go to Basic Page</Link>
    </nav>
  </div>
</template>
