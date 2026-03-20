<script setup lang="ts">
import SSRLayout from '../../Layouts/SSRLayout.vue'

defineOptions({
  layout: (props: Record<string, unknown>) => [SSRLayout, { title: 'Profile: ' + props.pageTitle }],
})
</script>

<template>
  <div>
    <p data-testid="page-content">Callback Content</p>
  </div>
</template>
