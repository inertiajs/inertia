<template>
  <div>
    <span class="text">Simple Persistent Layout - Page A</span>
    <inertia-link href="/persistent-layouts/shorthand/simple/page-b">Page B</inertia-link>
  </div>
</template>
<script>
import Layout from '@/Layouts/SiteLayout.vue'

export default {
  layout: Layout,
  created() {
    window._inertia_page_props = this.$vnode.data.props
  },
}
</script>
