<script lang="ts">
import FlashLayout from '../Components/FlashLayout.vue'
export default { layout: FlashLayout }
</script>

<script setup lang="ts">
import { Head, Link, router } from '@inertiajs/vue3'

const triggerFrontendFlash = () => {
  router.flash('message', 'Hello from the frontend!')
}

const triggerMultipleFlash = () => {
  router.flash({
    message: 'Multiple items',
    count: 42,
  })
}
</script>

<template>
  <Head title="Flash" />
  <h1 class="text-3xl">Flash</h1>

  <div class="mt-6 space-y-6">
    <div>
      <h2 class="text-lg font-semibold">Current page.flash</h2>
      <pre class="mt-2 rounded-sm bg-gray-100 p-3 text-sm">{{ $page.flash ?? 'null' }}</pre>
    </div>

    <div class="space-y-3">
      <h2 class="text-lg font-semibold">Server-side Flash</h2>
      <div>
        <Link href="/flash/direct" class="rounded-sm bg-slate-800 px-4 py-2 text-white">Flash with render</Link>
      </div>
      <form @submit.prevent="router.post('/flash/form')">
        <button type="submit" class="rounded-sm bg-slate-800 px-4 py-2 text-white">Flash with back()</button>
      </form>
      <div>
        <button @click="router.post('/flash/submit')" class="rounded-sm bg-slate-800 px-4 py-2 text-white">
          Flash with redirect
        </button>
      </div>
    </div>

    <div class="space-y-3">
      <h2 class="text-lg font-semibold">Frontend Flash</h2>
      <div class="flex gap-3">
        <button @click="triggerFrontendFlash" class="rounded-sm bg-slate-800 px-4 py-2 text-white">
          router.flash(key, value)
        </button>
        <button @click="triggerMultipleFlash" class="rounded-sm bg-slate-800 px-4 py-2 text-white">
          router.flash(object)
        </button>
      </div>
    </div>
  </div>
</template>
