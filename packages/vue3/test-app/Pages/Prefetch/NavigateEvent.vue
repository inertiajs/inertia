<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import type { Component, VNode } from 'vue'
import Layout from '@/Layouts/NavigateEventTest.vue'

type RenderFunction = (component: Component, children: Component[]) => VNode

defineOptions({
  layout: (h: RenderFunction, page: Component) => h(Layout, [page]),
})
</script>

<template>
  <Link href="/prefetch/navigate-event/cached" prefetch="mount">Prefetched Link</Link>
  <Link href="/prefetch/navigate-event/fresh">Regular Link</Link>
</template>
