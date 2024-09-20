<script lang="ts">
import Layout from '@/Layouts/Prefetch.vue'

export default {
  layout: (h, page) => h(Layout, [page]),
}
</script>

<script setup lang="ts">
defineProps<{
  pageNumber: string
}>()
</script>

<template>
  <div>This is page {{ pageNumber }}</div>
</template>
