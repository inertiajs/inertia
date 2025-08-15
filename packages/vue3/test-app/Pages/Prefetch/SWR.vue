<script lang="ts">
import type { Component } from 'vue'
import Layout from '@/Layouts/SWR.vue'

export default {
  layout: (h: Function, page: Component) => h(Layout, [page]),
}
</script>

<script setup lang="ts">
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
