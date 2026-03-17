<script setup lang="ts">
import SSRLayout from '../../Layouts/SSRLayout.vue'

defineOptions({
  layout: SSRLayout,
})
</script>

<template>
  <div>
    <p data-testid="page-content">Page B Content</p>
  </div>
</template>
