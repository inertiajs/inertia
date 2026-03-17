<script setup lang="ts">
import { useLayoutProps } from '@inertiajs/vue3'

const layoutProps = useLayoutProps({
  title: 'Default Title',
})
</script>

<template>
  <div class="ssr-layout">
    <h1 data-testid="layout-title">{{ layoutProps.title }}</h1>
    <slot />
  </div>
</template>
