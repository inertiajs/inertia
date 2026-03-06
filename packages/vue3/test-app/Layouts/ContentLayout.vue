<script setup lang="ts">
import { useLayoutProps } from '@inertiajs/vue3'
import { onMounted } from 'vue'

const id = String(Date.now() + Math.random())

onMounted(() => {
  window._inertia_content_layout_id = id
})

const layoutProps = useLayoutProps({
  padding: 'md',
  maxWidth: 'lg',
})
</script>

<template>
  <div class="content-layout" :data-padding="layoutProps.padding" :data-max-width="layoutProps.maxWidth">
    <div class="content-wrapper">
      <slot />
    </div>
  </div>
</template>
