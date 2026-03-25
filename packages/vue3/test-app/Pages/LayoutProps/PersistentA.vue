<script setup lang="ts">
import AppLayout from '@/Layouts/AppLayout.vue'
import ContentLayout from '@/Layouts/ContentLayout.vue'
import { Link } from '@inertiajs/vue3'

defineOptions({
  layout: {
    app: [AppLayout, { title: 'Persistent Page A' }],
    content: [ContentLayout, { padding: 'lg' }],
  },
})
</script>

<template>
  <div>
    <h2>Persistent Page A</h2>

    <nav>
      <Link href="/layout-props/persistent-b">Go to Page B</Link>
    </nav>
  </div>
</template>
