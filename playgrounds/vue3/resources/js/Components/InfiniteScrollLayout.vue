<script setup lang="ts">
import { Link, usePage } from '@inertiajs/vue3'
import { computed } from 'vue'

const page = usePage()

const appName = computed(() => page.props.appName)
</script>

<template>
  <nav class="flex items-center px-10 py-6 space-x-6 text-white bg-slate-800">
    <div class="px-4 py-1 rounded-lg bg-slate-700">{{ appName }}</div>
    <Link href="/infinite-scroll/chat" class="hover:underline">Chat</Link>
    <Link href="/infinite-scroll/dashboard" class="hover:underline">Dashboard</Link>
    <Link href="/infinite-scroll/photos" class="hover:underline">Photos</Link>
  </nav>
  <main class="px-10 py-8">
    <slot />
  </main>
</template>
