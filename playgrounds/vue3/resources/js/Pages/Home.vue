<script lang="ts">
import Layout from '../Components/Layout.vue'
export default { layout: Layout }
</script>

<script setup lang="ts">
import { Head, Link, router } from '@inertiajs/vue3'
defineProps({
  date: String,
  other_date: String,
})
</script>

<template>
  <Head title="Home" />
  <h1 class="text-3xl">Home</h1>
  <div class="mt-6 space-y-4">
    <div>
      <Link href="/article#far-down" class="text-blue-700 underline">Link to bottom of article page</Link>
    </div>

    <div>
      <div>Date: {{ date }}</div>
      <div>Other Date: {{ other_date }}</div>
    </div>

    <div>
      <button type="button" @click="router.clearHistory()" class="rounded-lg bg-blue-500 px-4 py-2 text-white">
        Clear History
      </button>
      <button
        type="button"
        @click="router.reload({ only: ['other_date'] })"
        class="rounded-lg bg-blue-500 px-4 py-2 text-white"
      >
        Reload it
      </button>
    </div>
  </div>
</template>
