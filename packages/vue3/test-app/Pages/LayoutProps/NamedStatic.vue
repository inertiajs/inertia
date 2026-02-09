<script lang="ts">
import AppLayout from '@/Layouts/AppLayout.vue'
import ContentLayout from '@/Layouts/ContentLayout.vue'

export default {
  layout: {
    app: [AppLayout, { theme: 'dark' }],
    content: [ContentLayout, { padding: 'sm' }],
  },
}
</script>

<script setup lang="ts">
import { Link, setLayoutProps, setLayoutPropsFor } from '@inertiajs/vue3'

setLayoutProps({
  title: 'Named Layouts with Static Props',
})

setLayoutPropsFor('content', {
  maxWidth: '4xl',
})
</script>

<template>
  <div>
    <h2>Named Layouts with Static Props</h2>
    <p>This page uses named layouts with both static and dynamic props.</p>
    <p>AppLayout: title from setLayoutProps, theme="dark" (static)</p>
    <p>ContentLayout: padding="sm" (static), maxWidth="4xl" (from setLayoutPropsFor)</p>

    <nav>
      <Link href="/layout-props/basic">Go to Basic Page</Link>
    </nav>
  </div>
</template>
