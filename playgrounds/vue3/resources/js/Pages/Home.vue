<script lang="ts">
import Layout from '../Components/Layout.vue'
export default { layout: Layout }
</script>

<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import { useHead } from 'unhead';
useHead({
    title: 'Home',
    meta: [
        {
            name: 'description',
            content: 'The Inertia Vue3 playground homepage',
        },
    ],
})
</script>

<template>
  <h1 class="text-3xl">Home</h1>
  <p class="mt-6">
    <Link href="/article#far-down" class="text-blue-700 underline">Link to bottom of article page</Link>
  </p>
</template>
