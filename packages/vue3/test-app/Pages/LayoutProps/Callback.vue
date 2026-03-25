<script setup lang="ts">
import AppLayout from '@/Layouts/AppLayout.vue'
import { Link } from '@inertiajs/vue3'

defineOptions({
  layout: (props: { userName: string }) => [AppLayout, { title: 'Profile: ' + props.userName, showSidebar: false }],
})
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
