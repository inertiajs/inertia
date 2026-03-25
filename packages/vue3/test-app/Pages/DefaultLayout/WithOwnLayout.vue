<script setup lang="ts">
import PageLayout from '@/Layouts/PageLayout.vue'
import { Link } from '@inertiajs/vue3'

defineOptions({
  layout: PageLayout,
})
</script>

<template>
  <div>
    <span id="text">DefaultLayout/WithOwnLayout</span>
    <Link href="/default-layout">Back to Index</Link>
  </div>
</template>
