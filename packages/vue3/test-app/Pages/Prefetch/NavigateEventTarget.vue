<script setup lang="ts">
import type { Component, VNode } from 'vue'
import Layout from '@/Layouts/NavigateEventTest.vue'

type RenderFunction = (component: Component, children: Component[]) => VNode

defineOptions({
  layout: (h: RenderFunction, page: Component) => h(Layout, [page]),
})

defineProps<{
  label: string
}>()
</script>

<template>
  <div>This is the {{ label }} target</div>
</template>
