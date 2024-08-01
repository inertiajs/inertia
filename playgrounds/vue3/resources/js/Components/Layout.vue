<script setup lang="ts">
import { Link, usePage } from '@inertiajs/vue3'
import { computed } from 'vue'

const page = usePage()

const appName = computed(() => page.props.appName)
</script>

<template>
  <nav class="flex items-center px-10 py-6 space-x-6 text-white bg-slate-800">
    <div class="px-4 py-1 rounded-lg bg-slate-700">{{ appName }}</div>
    <Link href="/" class="hover:underline" prefetch>Home</Link>
    <Link href="/users" class="hover:underline" :prefetch="['mount', 'click']" :cache-for="['5s', '10s']">Users</Link>
    <Link href="/article" class="hover:underline" prefetch="hover" :cache-for="6000">Article</Link>
    <Link href="/form" class="hover:underline" :prefetch="['mount', 'click']" cache-for="1m">Form</Link>
    <Link href="/logout" method="post" class="hover:underline">Logout</Link>
    <Link href="/goodbye" class="hover:underline">External</Link>
    <Link href="/async" class="hover:underline">Async Request</Link>
    <Link href="/defer" class="hover:underline">Defer</Link>
    <Link href="/poll" class="hover:underline">Poll</Link>
  </nav>
  <main class="px-10 py-8">
    <slot />
  </main>
</template>
