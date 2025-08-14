<script setup lang="ts">
import { Link } from '@inertiajs/vue3'

defineProps({
  page: Number,
})
</script>

<template>
  <div>
    <h1 style="font-size: 40px">Page {{ page }}</h1>

    <Link href="/links/cancel-sync-request/1"> Go to Page 1 </Link>
    <Link href="/links/cancel-sync-request/2"> Go to Page 2 </Link>
    <Link href="/links/cancel-sync-request/3"> Go to Page 3 </Link>
  </div>
</template>
