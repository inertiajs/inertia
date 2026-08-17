<script setup lang="ts">
import { ClientOnly } from '@inertiajs/vue3'

const clientPath = () => window.location.pathname
</script>

<template>
  <div>
    <h1 data-testid="ssr-title">SSR ClientOnly</h1>

    <ClientOnly>
      <template #fallback>
        <p data-testid="client-only-fallback">Loading widget...</p>
      </template>

      <p data-testid="client-only-content">Client path: {{ clientPath() }}</p>
    </ClientOnly>
  </div>
</template>
