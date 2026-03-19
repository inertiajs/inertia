<script lang="ts">
import AppLayout from '@/Layouts/AppLayout.vue'
import ContentLayout from '@/Layouts/ContentLayout.vue'

export default {
  layout: {
    app: AppLayout,
    content: ContentLayout,
  },
  layoutProps: (layout: (...args: unknown[]) => void) => {
    layout({ title: 'Persistent Page B' })
    layout('content', { padding: 'xl' })
  },
}
</script>

<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
</script>

<template>
  <div>
    <h2>Persistent Page B</h2>

    <nav>
      <Link href="/layout-props/persistent-a">Go to Page A</Link>
    </nav>
  </div>
</template>
