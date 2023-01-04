<script setup>
import { Link } from '@inertiajs/vue2'
</script>

<template>
  <div>
    <nav class="space-x-6 bg-slate-800 p-6 text-white">
      <Link href="/">Home</Link>
      <Link href="/users">Users</Link>
    </nav>
    <main class="p-6">
      <slot />
    </main>
  </div>
</template>
