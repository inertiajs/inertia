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
  title: 'Persistent Page B',
})

setLayoutPropsFor('content', {
  padding: 'xl',
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
