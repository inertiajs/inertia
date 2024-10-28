<script setup lang="ts">
import { Link, usePage } from '@inertiajs/vue3'
import { computed } from 'vue'

const page = usePage()

const appName = computed(() => page.props.appName)
</script>

<template>
  <nav class="flex items-center space-x-6 bg-slate-800 px-10 py-6 text-white">
    <div class="rounded-lg bg-slate-700 px-4 py-1">{{ appName }}</div>
    <Link href="/infinite-scroll/photos" class="hover:underline" prefetch>Photos</Link>
  </nav>
  <main class="px-10 py-8">
    <slot />
  </main>
</template>
