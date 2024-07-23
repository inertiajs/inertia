<script>
import NestedLayout from '@/Layouts/NestedLayout.vue'
import SiteLayout from '@/Layouts/SiteLayout.vue'
import { Link } from '@inertiajs/vue3'

export default {
  layout: (h, page) => {
    return h(SiteLayout, [h(NestedLayout, [page])])
  },
}
</script>

<template>
  <div>
    <span class="text">Nested Persistent Layout - Page A</span>
    <Link href="/persistent-layouts/render-function/nested/page-b">Page B</Link>
  </div>
</template>
