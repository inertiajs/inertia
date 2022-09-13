<template>
  <div>
    <span class="text">Nested Persistent Layout - Page A</span>
    <inertia-link href="/persistent-layouts/shorthand/nested/page-b">Page B</inertia-link>
  </div>
</template>
<script>
import SiteLayout from '@/Layouts/SiteLayout'
import NestedLayout from '@/Layouts/NestedLayout'

export default {
  layout: [SiteLayout, NestedLayout],
  created() {
    window._inertia_page_props = this.$vnode.data.props
  },
}
</script>
