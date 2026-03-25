<script setup lang="ts">
import AppLayout from '@/Layouts/AppLayout.vue'
import ContentLayout from '@/Layouts/ContentLayout.vue'
import { Link } from '@inertiajs/vue3'

defineOptions({
  layout: {
    app: { component: AppLayout, props: { title: 'Named Object Page', showSidebar: false, theme: 'dark' } },
    content: { component: ContentLayout, props: { padding: 'sm', maxWidth: '4xl' } },
  },
})
</script>

<template>
  <div>
    <h2>Named Object Layout Page</h2>

    <nav>
      <Link href="/layout-props/basic">Go to Basic Page</Link>
    </nav>
  </div>
</template>
