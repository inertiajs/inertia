<script setup lang="ts">
import NestedLayout from '@/Layouts/NestedLayout.vue'
import SiteLayout from '@/Layouts/SiteLayout.vue'
import { Link, usePage } from '@inertiajs/vue3'

defineOptions({
  layout: [SiteLayout, NestedLayout],
})

window._inertia_page_props = usePage().props
</script>

<template>
  <div>
    <span class="text">Nested Persistent Layout - Page A</span>
    <Link href="/persistent-layouts/shorthand/nested/page-b">Page B</Link>
  </div>
</template>
