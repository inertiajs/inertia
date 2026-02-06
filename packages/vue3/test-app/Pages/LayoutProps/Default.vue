<script lang="ts">
import AppLayout from '@/Layouts/AppLayout.vue'

export default {
  layout: AppLayout,
}
</script>

<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
</script>

<template>
  <div>
    <h2>Default Layout Props Page</h2>
    <p>This page does not set any layout props. All defaults should apply.</p>

    <nav>
      <Link href="/layout-props/static">Go to Static Page</Link>
    </nav>
  </div>
</template>
