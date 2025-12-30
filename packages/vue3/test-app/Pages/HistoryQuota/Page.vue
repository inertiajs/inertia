<script setup>
import { Link } from '@inertiajs/vue3'

defineProps({
  pageNumber: Number,
  largeData: String,
})
</script>

<template>
  <div>
    <h1>History Quota Test - Page {{ pageNumber }}</h1>
    <p>Data size: {{ largeData?.length?.toLocaleString() }} bytes</p>

    <div style="margin-top: 20px">
      <Link v-for="n in 20" :key="n" :href="`/history-quota/${n}`" style="margin-right: 10px"> Page {{ n }} </Link>
    </div>

    <div style="height: 5000px"></div>
  </div>
</template>
