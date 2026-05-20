<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import NestedLayout from '@/Layouts/NestedLayout.vue'
import SiteLayout from '@/Layouts/SiteLayout.vue'

defineOptions({
  layout: [SiteLayout, NestedLayout],
})
</script>

<template>
  <div>
    <span class="text">Nested Persistent Layout - Page B</span>
    <Link href="/persistent-layouts/shorthand/nested/page-a">Page A</Link>
  </div>
</template>
