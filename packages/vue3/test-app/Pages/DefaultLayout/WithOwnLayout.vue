<script lang="ts">
import PageLayout from '@/Layouts/PageLayout.vue'

export default {
  layout: PageLayout,
}
</script>

<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
</script>

<template>
  <div>
    <span id="text">DefaultLayout/WithOwnLayout</span>
    <Link href="/default-layout">Back to Index</Link>
  </div>
</template>
