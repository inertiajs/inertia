<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3'

// This will cause an SSR error because window doesn't exist in Node.js
const viewportWidth = window.innerWidth
</script>

<template>
  <Head title="Window Error - SSR Debug" />
  <h1 class="text-3xl">Window Error Demo</h1>

  <p class="mt-6">
    If you're seeing this page, it means SSR failed and Laravel fell back to client-side rendering. Check your Vite
    console for the error message!
  </p>

  <p class="mt-4">
    Viewport width: <strong>{{ viewportWidth }}px</strong>
  </p>

  <p class="mt-6">
    <Link href="/ssr-debug" class="text-blue-700 underline">Back to SSR Debug</Link>
  </p>
</template>
