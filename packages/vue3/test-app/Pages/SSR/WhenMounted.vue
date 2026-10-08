<script setup lang="ts">
import { Link, WhenMounted } from '@inertiajs/vue3'
import WhenMountedChild from '@/Components/WhenMountedChild.vue'
import WhenMountedFallback from '@/Components/WhenMountedFallback.vue'

const clientPath = () => window.location.pathname
</script>

<template>
  <div>
    <h1 data-testid="ssr-title">SSR WhenMounted</h1>

    <WhenMounted>
      <template #fallback>
        <WhenMountedFallback />
      </template>

      <p data-testid="when-mounted-content">Client path: {{ clientPath() }}</p>
      <WhenMountedChild />
    </WhenMounted>

    <Link data-testid="leave-link" href="/ssr/page2">Leave</Link>
    <Link data-testid="revisit-link" href="/ssr/when-mounted">Revisit</Link>
  </div>
</template>
