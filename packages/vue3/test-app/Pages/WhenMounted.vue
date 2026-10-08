<script setup lang="ts">
import { Link, WhenMounted } from '@inertiajs/vue3'
import WhenMountedChild from '@/Components/WhenMountedChild.vue'
import WhenMountedFallback from '@/Components/WhenMountedFallback.vue'
</script>

<template>
  <div>
    <h1 id="title">WhenMounted</h1>

    <WhenMounted>
      <template #fallback>
        <WhenMountedFallback />
      </template>

      <p id="when-mounted-content">Client path: /when-mounted</p>
      <WhenMountedChild />
    </WhenMounted>

    <Link id="revisit-link" href="/when-mounted">Revisit</Link>
    <Link id="preserve-state-link" href="/when-mounted" preserve-state>Revisit (preserve state)</Link>
    <Link id="leave-link" href="/">Leave</Link>
  </div>
</template>
