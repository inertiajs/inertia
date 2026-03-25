<script setup lang="ts">
import NestedLayout from '@/Layouts/NestedLayout.vue'
import SiteLayout from '@/Layouts/SiteLayout.vue'
import { Link } from '@inertiajs/vue3'
import type { Component, VNode } from 'vue'

type RenderFunction = (component: Component, children: Component[]) => VNode

defineOptions({
  layout: (h: RenderFunction, page: Component) => {
    return h(SiteLayout, [h(NestedLayout, [page])])
  },
})
</script>

<template>
  <div>
    <span class="text">Nested Persistent Layout - Page B</span>
    <Link href="/persistent-layouts/render-function/nested/page-a">Page A</Link>
  </div>
</template>
