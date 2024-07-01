<template>
  <div>
    <span class="text">Nested Persistent Layout - Page A</span>
    <inertia-link href="/persistent-layouts/shorthand/nested/page-b">Page B</inertia-link>
  </div>
</template>
<script>
import NestedLayout from '@/Layouts/NestedLayout.vue'
import SiteLayout from '@/Layouts/SiteLayout.vue'

export default {
  layout: [SiteLayout, NestedLayout],
  created() {
    // this.$.props for declared props
    window._inertia_page_props = this.$.attrs
  },
}
</script>
