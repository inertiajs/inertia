<script>
import NestedLayout from '@/Layouts/NestedLayout.vue'
import SiteLayout from '@/Layouts/SiteLayout.vue'

export default {
  layout: (h, page) => {
    return h(SiteLayout, [h(NestedLayout, [page])])
  },
}
</script>

<script setup>
import { Link } from '@inertiajs/vue3'
</script>

<template>
  <div>
    <span class="text">Nested Persistent Layout - Page B</span>
    <Link href="/persistent-layouts/render-function/nested/page-a">Page A</Link>
  </div>
</template>
