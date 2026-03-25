<script setup lang="ts">
import Layout from '@/Layouts/SWR.vue'
import type { Component, VNode } from 'vue'

type RenderFunction = (component: Component, children: Component[]) => VNode

defineOptions({
  layout: (h: RenderFunction, page: Component) => h(Layout, [page]),
})

defineProps<{
  pageNumber: string
  lastLoaded: number
}>()
</script>

<template>
  <div>This is page {{ pageNumber }}</div>
  <div>
    Last loaded at <span id="last-loaded">{{ lastLoaded }}</span>
  </div>
</template>
