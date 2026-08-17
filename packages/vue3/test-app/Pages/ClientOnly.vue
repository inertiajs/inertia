<script setup lang="ts">
import { ClientOnly } from '@inertiajs/vue3'
</script>

<template>
  <div>
    <h1 data-testid="title">ClientOnly</h1>

    <ClientOnly>
      <template #fallback>
        <p data-testid="client-only-fallback">Loading widget...</p>
      </template>

      <p data-testid="client-only-content">Client path: /client-only</p>
    </ClientOnly>
  </div>
</template>
