<script setup lang="ts">
import { Link } from '@inertiajs/vue3'

defineProps<{
  pageNumber: number
  largeData: string
}>()
</script>

<template>
  <div>
    <h1>History Quota Test - Page {{ pageNumber }}</h1>
    <p>Data size: {{ largeData?.length?.toLocaleString() }} bytes</p>

    <div style="margin-top: 20px">
      <Link :href="`/history-quota/1`"> Page 1 </Link>
      <Link :href="`/history-quota/${pageNumber + 1}`"> Page {{ pageNumber + 1 }} </Link>
    </div>

    <div style="height: 5000px"></div>
  </div>
</template>
