<script setup lang="ts">
// This component is used for checking the TypeScript implementation; there is no Playwright test depending on it.
import { resetLayoutProps, setLayoutProps, setLayoutPropsFor } from '@inertiajs/vue3'

declare module '@inertiajs/core' {
  export interface InertiaConfig {
    layoutProps: {
      title: string
      showSidebar: boolean
    }
    namedLayoutProps: {
      app: { title: string; theme: 'light' | 'dark' }
      content: { padding: string; maxWidth: string }
    }
  }
}

// setLayoutProps accepts configured layout props
setLayoutProps({ title: 'Hello' })
setLayoutProps({ showSidebar: true })
setLayoutProps({ title: 'Hello', showSidebar: false })

// @ts-expect-error - 'invalid' does not exist on layout props
setLayoutProps({ invalid: true })

// @ts-expect-error - 'title' should be string, not number
setLayoutProps({ title: 123 })

// setLayoutPropsFor accepts configured named layout props
setLayoutPropsFor('app', { title: 'Hello' })
setLayoutPropsFor('app', { theme: 'dark' })
setLayoutPropsFor('app', { title: 'Hello', theme: 'light' })
setLayoutPropsFor('content', { padding: 'lg' })
setLayoutPropsFor('content', { maxWidth: '2xl' })
setLayoutPropsFor('content', { padding: 'lg', maxWidth: '2xl' })

// @ts-expect-error - 'invalid' is not a configured layout name
setLayoutPropsFor('invalid', { foo: 'bar' })

// @ts-expect-error - 'padding' does not exist on app layout props
setLayoutPropsFor('app', { padding: 'lg' })

// @ts-expect-error - 'theme' should be 'light' | 'dark', not number
setLayoutPropsFor('app', { theme: 123 })

// resetLayoutProps works without arguments
resetLayoutProps()
</script>

<template>
  <div />
</template>
