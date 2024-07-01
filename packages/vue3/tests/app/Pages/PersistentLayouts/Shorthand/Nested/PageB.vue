<template>
  <div>
    <span class="text">Nested Persistent Layout - Page B</span>
    <inertia-link href="/persistent-layouts/shorthand/nested/page-a">Page A</inertia-link>
  </div>
</template>
<script>
import NestedLayout from '@/Layouts/NestedLayout.vue'
import SiteLayout from '@/Layouts/SiteLayout.vue'

export default {
  layout: [SiteLayout, NestedLayout],
}
</script>
