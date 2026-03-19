<script setup lang="ts">
import SSRLayout from '../../Layouts/SSRLayout.vue'

defineOptions({
  layout: SSRLayout,
  layoutProps: { title: 'Page A Title' },
})
</script>

<template>
  <div>
    <p data-testid="page-content">Page A Content</p>
  </div>
</template>
