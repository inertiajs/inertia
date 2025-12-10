<script setup lang="ts">
import { Link, usePage } from '@inertiajs/vue3'
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    padding?: boolean
  }>(),
  {
    padding: true,
  },
)

const page = usePage()

const appName = computed(() => page.props.appName)
</script>

<template>
  <nav class="flex items-center space-x-6 bg-slate-800 px-10 py-6 text-white">
    <div class="rounded-lg bg-slate-700 px-4 py-1">{{ appName }}</div>
    <Link href="/" class="hover:underline" prefetch>Home</Link>
    <Link href="/users" class="hover:underline" prefetch :cache-for="['2s', '1m']">Users</Link>
    <Link href="/article" class="hover:underline" prefetch="click">Article</Link>
    <Link href="/form" class="hover:underline" :prefetch="['mount', 'click']" cache-for="1m">Form</Link>
    <Link href="/form-component" class="hover:underline">Form Comp</Link>
    <Link href="/logout" method="post" class="hover:underline">Logout</Link>
    <Link href="/goodbye" class="hover:underline">External</Link>
    <Link href="/async" class="hover:underline">Async</Link>
    <Link href="/defer" class="hover:underline">Defer</Link>
    <Link href="/poll" class="hover:underline">Poll</Link>
    <Link href="/chat" class="hover:underline">Chat</Link>
    <Link href="/photo-grid" class="hover:underline">Photo Grid</Link>
    <Link href="/photo-grid/horizontal" class="hover:underline">Photo Row</Link>
    <Link href="/data-table" class="hover:underline">Table</Link>
    <Link href="/once/1" class="hover:underline">Once</Link>
  </nav>
  <main :class="padding ? 'px-10 py-8' : ''">
    <slot />
  </main>
</template>
