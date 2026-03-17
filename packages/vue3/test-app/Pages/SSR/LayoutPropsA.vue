<script setup lang="ts">
import { setLayoutProps } from '@inertiajs/vue3'
import SSRLayout from '../../Layouts/SSRLayout.vue'

defineOptions({
  layout: SSRLayout,
})

setLayoutProps({ title: 'Page A Title' })
</script>

<template>
  <div>
    <p data-testid="page-content">Page A Content</p>
  </div>
</template>
