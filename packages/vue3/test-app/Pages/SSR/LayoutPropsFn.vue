<script setup lang="ts">
import SSRLayout from '../../Layouts/SSRLayout.vue'

defineOptions({
  layout: SSRLayout,
  layoutProps: (layout: (...args: unknown[]) => void, props: Record<string, unknown>) => {
    layout({ title: props.pageTitle })
  },
})
</script>

<template>
  <div>
    <p data-testid="page-content">Function Form Content</p>
  </div>
</template>
