<script>
import Layout from '../Components/Layout.vue'
export default { layout: Layout }
</script>

<script setup>
import { Head, Link } from '@inertiajs/vue2'
</script>

<template>
  <div>
    <Head title="Home" />
    <h1 class="text-3xl">Home</h1>
    <p class="mt-6">
      <Link href="/article#far-down" class="text-blue-700 underline">Link to bottom of article page</Link>
    </p>
  </div>
</template>
