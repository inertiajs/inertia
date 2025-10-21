<script lang="ts">
import type { Component, VNode } from 'vue'
import NestedLayout from '@/Layouts/NestedLayout.vue'
import SiteLayout from '@/Layouts/SiteLayout.vue'

type RenderFunction = (component: Component, children: Component[]) => VNode

export default {
  layout: (h: RenderFunction, page: Component) => {
    return h(SiteLayout, [h(NestedLayout, [page])])
  },
}
</script>

<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
</script>

<template>
  <div>
    <span class="text">Nested Persistent Layout - Page A</span>
    <Link href="/persistent-layouts/render-function/nested/page-b">Page B</Link>
  </div>
</template>
