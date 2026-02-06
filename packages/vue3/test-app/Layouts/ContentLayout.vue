<script setup lang="ts">
import { useLayoutProps } from '@inertiajs/vue3'

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
