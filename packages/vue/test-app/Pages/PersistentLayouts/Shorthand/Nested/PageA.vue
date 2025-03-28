<script>
import NestedLayout from '@/Layouts/NestedLayout.vue'
import SiteLayout from '@/Layouts/SiteLayout.vue'

export default {
  layout: [SiteLayout, NestedLayout],
}
</script>

<script setup>
import { Link, usePage } from '@inertiajs/vue3'
window._inertia_page_props = usePage().props
</script>

<template>
  <div>
    <span class="text">Nested Persistent Layout - Page A</span>
    <Link href="/persistent-layouts/shorthand/nested/page-b">Page B</Link>
  </div>
</template>
