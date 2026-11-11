<script lang="ts">
import { usePage as moduleScopeUsePage } from '@inertiajs/vue3'

const moduleScopePage = moduleScopeUsePage()

declare global {
  interface Window {
    moduleScopePageComponent: string
    moduleScopePageUrl: string
  }
}

window.moduleScopePageComponent = String(moduleScopePage.component ?? '')
window.moduleScopePageUrl = moduleScopePage.url ?? undefined
</script>

<script setup lang="ts">
import { usePage } from '@inertiajs/vue3'

const page = usePage()
</script>

<template>
  <div>Module scope page</div>
  <div data-testid="module-scope-page">{{ page.component }}|{{ page.url }}</div>
</template>
