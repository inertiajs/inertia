<script setup lang="ts">
import AppLayout from '@/Layouts/AppLayout.vue'
import ContentLayout from '@/Layouts/ContentLayout.vue'
import { Link } from '@inertiajs/vue3'

defineOptions({
  layout: {
    app: [AppLayout, { title: 'Persistent Page B' }],
    content: [ContentLayout, { padding: 'xl' }],
  },
})
</script>

<template>
  <div>
    <h2>Persistent Page B</h2>

    <nav>
      <Link href="/layout-props/persistent-a">Go to Page A</Link>
    </nav>
  </div>
</template>
