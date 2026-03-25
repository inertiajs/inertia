<script setup lang="ts">
// This component is used for checking the TypeScript implementation; there is no Playwright test depending on it.
import { resetLayoutProps, setLayoutProps } from '@inertiajs/vue3'

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

// setLayoutProps with name accepts configured named layout props
setLayoutProps('app', { title: 'Hello' })
setLayoutProps('app', { theme: 'dark' })
setLayoutProps('app', { title: 'Hello', theme: 'light' })
setLayoutProps('content', { padding: 'lg' })
setLayoutProps('content', { maxWidth: '2xl' })
setLayoutProps('content', { padding: 'lg', maxWidth: '2xl' })

// @ts-expect-error - 'invalid' is not a configured layout name
setLayoutProps('invalid', { foo: 'bar' })

// @ts-expect-error - 'padding' does not exist on app layout props
setLayoutProps('app', { padding: 'lg' })

// @ts-expect-error - 'theme' should be 'light' | 'dark', not number
setLayoutProps('app', { theme: 123 })

// setLayoutProps accepts a custom type override
setLayoutProps<{ custom: string }>({ custom: 'value' })

// @ts-expect-error - 'custom' should be string, not number
setLayoutProps<{ custom: string }>({ custom: 123 })

// setLayoutProps with name accepts a custom type override
setLayoutProps<{ custom: string }>('app', { custom: 'value' })

// @ts-expect-error - 'custom' should be string, not number
setLayoutProps<{ custom: string }>('app', { custom: 123 })

// resetLayoutProps works without arguments
resetLayoutProps()
</script>

<template>
  <div />
</template>
