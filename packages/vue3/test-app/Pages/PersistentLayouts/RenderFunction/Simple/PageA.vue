<script setup lang="ts">
import Layout from '@/Layouts/SiteLayout.vue'
import { Link } from '@inertiajs/vue3'
import type { Component, VNode } from 'vue'

type RenderFunction = (component: Component, children: Component[]) => VNode

defineOptions({
  layout: (h: RenderFunction, page: Component) => h(Layout, [page]),
})
</script>

<template>
  <div>
    <span class="text">Simple Persistent Layout - Page A</span>
    <Link href="/persistent-layouts/render-function/simple/page-b">Page B</Link>
  </div>
</template>
