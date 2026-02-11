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
  title: 'Persistent Page A',
})

setLayoutPropsFor('content', {
  padding: 'lg',
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
