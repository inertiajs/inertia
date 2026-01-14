<script setup lang="ts">
import { WhenVisible } from '@inertiajs/vue3'
</script>

<template>
  <div style="margin-top: 5000px">
    <WhenVisible data="lazyData" always>
      <template #default="{ fetching }">
        <div>Lazy data loaded!</div>
        <div v-if="fetching">Fetching in background...</div>
      </template>

      <template #fallback>
        <div>Loading lazy data...</div>
      </template>
    </WhenVisible>
  </div>
</template>
