<script setup lang="ts">
import Layout from '@/Layouts/SiteLayout.vue'
import { Link, usePage } from '@inertiajs/vue3'

defineOptions({
  layout: Layout,
})

window._inertia_page_props = usePage().props
</script>

<template>
  <div>
    <span class="text">Simple Persistent Layout - Page A</span>
    <Link href="/persistent-layouts/shorthand/simple/page-b">Page B</Link>
  </div>
</template>
