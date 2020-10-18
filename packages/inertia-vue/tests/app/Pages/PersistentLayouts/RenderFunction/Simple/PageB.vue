<template>
  <div>
    <span>Simple Persistent Layout - Page B</span>
    <inertia-link href="/persistent-layouts/render-function/simple/page-a">Page A</inertia-link>
  </div>
</template>
<script>
  import Layout from "@/Layouts/SiteLayout"

  export default {
    layout: (h, page) => h(Layout, [page]),
  }
</script>
