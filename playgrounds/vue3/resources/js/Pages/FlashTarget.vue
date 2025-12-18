<script lang="ts">
import FlashLayout from '../Components/FlashLayout.vue'
export default { layout: FlashLayout }
</script>

<script setup lang="ts">
import { Head, Link, usePage } from '@inertiajs/vue3'

const page = usePage()
</script>

<template>
  <Head title="Flash Target" />
  <h1 class="text-3xl">Flash Target</h1>

  <div class="mt-6 space-y-6">
    <div>
      <h2 class="text-lg font-semibold">Current page.flash</h2>
      <pre class="mt-2 rounded-sm bg-gray-100 p-3 text-sm">{{ page.flash ?? 'null' }}</pre>
    </div>

    <div>
      <Link href="/flash" class="rounded-sm bg-slate-800 px-4 py-2 text-white">Back to Flash</Link>
    </div>
  </div>
</template>
