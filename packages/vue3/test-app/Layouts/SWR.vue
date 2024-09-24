<script setup>
import { Link } from '@inertiajs/vue3'
</script>

<template>
  <div>
    <Link href="/prefetch/swr/2" prefetch="mount" cacheFor="1s">1s Expired</Link>
    <Link href="/prefetch/swr/3" prefetch="mount" :cacheFor="1000">1s Expired (Number)</Link>
    <Link href="/prefetch/swr/4" style="margin: 0 20px" :prefetch="['mount', 'hover']" :cacheFor="['1s', '10s']"
      >1s Stale, 2s Expired</Link
    >
    <Link href="/prefetch/swr/5" :prefetch="['mount', 'hover']" :cacheFor="[1000, 10000]">
      1s Stale, 2s Expired (Number)
    </Link>
    <div>
      <slot />
    </div>
  </div>
</template>
