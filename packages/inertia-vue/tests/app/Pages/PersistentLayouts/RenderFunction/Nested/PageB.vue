<template>
  <div>
    <span class="text">Nested Persistent Layout - Page B</span>
    <inertia-link href="/persistent-layouts/render-function/nested/page-a">Page A</inertia-link>
  </div>
</template>
<script>
  import SiteLayout from "@/Layouts/SiteLayout"
  import NestedLayout from "@/Layouts/NestedLayout"

  export default {
    layout: (h, page) => {
      return h(SiteLayout, [
        h(NestedLayout, [page]),
      ])
    },
  }
</script>
