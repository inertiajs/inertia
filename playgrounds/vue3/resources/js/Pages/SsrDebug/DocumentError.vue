<script lang="ts">
import Layout from '../../Components/Layout.vue'
export default { layout: Layout }
</script>

<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3'

// This will cause an SSR error because document doesn't exist in Node.js
const bodyClasses = document.body.className
</script>

<template>
  <Head title="Document Error - SSR Debug" />
  <h1 class="text-3xl">Document Error Demo</h1>

  <p class="mt-6">
    If you're seeing this page, it means SSR failed and Laravel fell back to client-side rendering.
    Check your Vite console for the error message!
  </p>

  <p class="mt-4">
    Body classes: <strong>{{ bodyClasses || '(none)' }}</strong>
  </p>

  <p class="mt-6">
    <Link href="/ssr-debug" class="text-blue-700 underline">Back to SSR Debug</Link>
  </p>
</template>
