<script setup lang="ts">
import { ClientOnly, Link } from '@inertiajs/vue3'
import ClientOnlyChild from '@/Components/ClientOnlyChild.vue'
import ClientOnlyFallback from '@/Components/ClientOnlyFallback.vue'
</script>

<template>
  <div>
    <h1 data-testid="title">ClientOnly</h1>

    <ClientOnly>
      <template #fallback>
        <ClientOnlyFallback />
      </template>

      <p data-testid="client-only-content">Client path: /client-only</p>
      <ClientOnlyChild />
    </ClientOnly>

    <Link data-testid="revisit-link" href="/client-only">Revisit</Link>
    <Link data-testid="preserve-state-link" href="/client-only" preserve-state>Revisit (preserve state)</Link>
    <Link data-testid="leave-link" href="/">Leave</Link>
  </div>
</template>
