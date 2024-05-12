<template>
  <div>
    <span class="text">Nested Persistent Layout - Page A</span>
    <inertia-link href="/persistent-layouts/render-function/nested/page-b">Page B</inertia-link>
  </div>
</template>
<script>
import NestedLayout from '@/Layouts/NestedLayout.vue'
import SiteLayout from '@/Layouts/SiteLayout.vue'

export default {
  layout: (h, page) => {
    return h(SiteLayout, [h(NestedLayout, [page])])
  },
}
</script>
