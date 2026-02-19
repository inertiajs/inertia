<script setup lang="ts">
import { useLayoutProps } from '@inertiajs/vue3'
import { getCurrentInstance, onMounted } from 'vue'

onMounted(() => {
  window._inertia_content_layout_id = String(getCurrentInstance()?.uid)
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
