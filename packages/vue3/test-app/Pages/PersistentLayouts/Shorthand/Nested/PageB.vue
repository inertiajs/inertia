<script>
import NestedLayout from '@/Layouts/NestedLayout.vue'
import SiteLayout from '@/Layouts/SiteLayout.vue'

export default {
  layout: [SiteLayout, NestedLayout],
}
</script>

<script setup>
import { Link } from '@inertiajs/vue3'
</script>

<template>
  <div>
    <span class="text">Nested Persistent Layout - Page B</span>
    <Link href="/persistent-layouts/shorthand/nested/page-a">Page A</Link>
  </div>
</template>
