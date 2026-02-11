<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
</script>

<template>
  <div>
    <span id="text">DefaultLayout/Index</span>
    <Link href="/default-layout/with-own-layout">With Own Layout</Link>
    <Link href="/default-layout/callback-excluded">Callback Excluded</Link>
  </div>
</template>
