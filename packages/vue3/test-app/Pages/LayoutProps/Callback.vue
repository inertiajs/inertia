<script lang="ts">
import AppLayout from '@/Layouts/AppLayout.vue'

export default {
  layout: (props: Record<string, unknown>) => [AppLayout, { title: 'Profile: ' + props.userName, showSidebar: false }],
}
</script>

<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
</script>

<template>
  <div>
    <h2>Callback Layout Props Page</h2>
    <p>This page uses a layout callback to derive props from page props.</p>

    <nav>
      <Link href="/layout-props/basic">Go to Basic Page</Link>
    </nav>
  </div>
</template>
