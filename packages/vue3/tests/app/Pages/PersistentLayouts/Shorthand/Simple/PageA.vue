<script>
import Layout from '@/Layouts/SiteLayout.vue'
import { Link } from '@inertiajs/vue3'

//   created() {
//     window._inertia_page_props = this.$vnode.data.props
//   },

export default {
  layout: Layout,
}
</script>

<template>
  <div>
    <span class="text">Simple Persistent Layout - Page A</span>
    <Link href="/persistent-layouts/shorthand/simple/page-b">Page B</Link>
  </div>
</template>
