<template>
  <div>
    <span>Nested Persistent Layout - Page B</span>
    <inertia-link href="/persistent-layouts/via-function/nested/page-a">Page A</inertia-link>
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
