<script setup lang="ts">
import { ClientOnly, Link } from '@inertiajs/vue3'
import ClientOnlyFallback from '@/Components/ClientOnlyFallback.vue'

const clientPath = () => window.location.pathname
</script>

<template>
  <div>
    <h1 data-testid="ssr-title">SSR ClientOnly</h1>

    <ClientOnly>
      <template #fallback>
        <ClientOnlyFallback />
      </template>

      <p data-testid="client-only-content">Client path: {{ clientPath() }}</p>
    </ClientOnly>

    <Link data-testid="leave-link" href="/ssr/page2">Leave</Link>
    <Link data-testid="revisit-link" href="/ssr/client-only">Revisit</Link>
  </div>
</template>
