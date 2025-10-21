<script lang="ts">
import type { Component, VNode } from 'vue'
import Layout from '@/Layouts/SiteLayout.vue'

type RenderFunction = (component: Component, children: Component[]) => VNode

export default {
  layout: (h: RenderFunction, page: Component) => h(Layout, [page]),
}
</script>

<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
</script>

<template>
  <div>
    <span class="text">Simple Persistent Layout - Page A</span>
    <Link href="/persistent-layouts/render-function/simple/page-b">Page B</Link>
  </div>
</template>
