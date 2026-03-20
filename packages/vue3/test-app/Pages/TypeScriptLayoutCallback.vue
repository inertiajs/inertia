<script lang="ts">
// This component is used for checking the TypeScript implementation; there is no Playwright test depending on it.
import AppLayout from '@/Layouts/AppLayout.vue'
import type { LayoutCallback } from '@inertiajs/vue3'

declare module '@inertiajs/core' {
  export interface InertiaConfig {
    sharedPageProps: {
      auth: { user: { name: string } | null }
    }
  }
}

const layout: LayoutCallback = (props) => {
  const name: string | undefined = props.auth.user?.name

  // @ts-expect-error - 'nonExistent' does not exist on shared page props
  const invalid = props.nonExistent

  return [AppLayout, { title: name }]
}

export default { layout }
</script>

<script setup lang="ts"></script>

<template>
  <div />
</template>
