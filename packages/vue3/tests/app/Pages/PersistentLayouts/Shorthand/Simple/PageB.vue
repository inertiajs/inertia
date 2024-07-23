<script>
import Layout from '@/Layouts/SiteLayout.vue'
import { Link } from '@inertiajs/vue3'

export default {
  layout: Layout,
}
</script>

<template>
  <div>
    <span class="text">Simple Persistent Layout - Page B</span>
    <Link href="/persistent-layouts/shorthand/simple/page-a">Page A</Link>
  </div>
</template>
