<script lang="ts">
import Layout from '../Components/Layout.vue'
export default { layout: Layout }
</script>

<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3'
</script>

<template>
  <Head title="Home" />
  <h1 class="text-3xl">Home</h1>
  <p class="mt-6">
    <Link href="/article#far-down" class="text-blue-700 underline">Link to bottom of article page</Link>
  </p>
</template>
