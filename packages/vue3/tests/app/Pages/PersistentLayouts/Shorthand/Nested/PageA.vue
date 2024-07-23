<script>
import NestedLayout from '@/Layouts/NestedLayout.vue'
import SiteLayout from '@/Layouts/SiteLayout.vue'
import { Link } from '@inertiajs/vue3'

// created() {
//   window._inertia_page_props = this.$vnode.data.props
// },

export default {
  layout: [SiteLayout, NestedLayout],
}
</script>

<template>
  <div>
    <span class="text">Nested Persistent Layout - Page A</span>
    <Link href="/persistent-layouts/shorthand/nested/page-b">Page B</Link>
  </div>
</template>
