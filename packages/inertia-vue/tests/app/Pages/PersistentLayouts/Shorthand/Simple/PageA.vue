<template>
  <div>
    <span class="text">Simple Persistent Layout - Page A</span>
    <inertia-link href="/persistent-layouts/shorthand/simple/page-b">Page B</inertia-link>
  </div>
</template>
<script>
  import Layout from "@/Layouts/SiteLayout"

  export default {
    layout: Layout,
  }
</script>
