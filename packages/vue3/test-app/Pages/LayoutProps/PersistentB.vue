<script lang="ts">
import AppLayout from '@/Layouts/AppLayout.vue'
import ContentLayout from '@/Layouts/ContentLayout.vue'

export default {
  layout: {
    app: [AppLayout, { title: 'Persistent Page B' }],
    content: [ContentLayout, { padding: 'xl' }],
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
