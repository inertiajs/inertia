<script>
import Layout from '@/Layouts/SiteLayout.vue'

export default {
  layout: Layout,
}
</script>

<script setup>
import { Link, usePage } from '@inertiajs/vue3'

window._inertia_page_props = usePage().props
</script>

<template>
  <div>
    <span class="text">Simple Persistent Layout - Page A</span>
    <Link href="/persistent-layouts/shorthand/simple/page-b">Page B</Link>
  </div>
</template>
