<script setup lang="ts">
import Layout from '@/Layouts/SiteLayout.vue'
import { Link } from '@inertiajs/vue3'

defineOptions({
  layout: Layout,
})
</script>

<template>
  <div>
    <span class="text">Simple Persistent Layout - Page B</span>
    <Link href="/persistent-layouts/shorthand/simple/page-a">Page A</Link>
  </div>
</template>
