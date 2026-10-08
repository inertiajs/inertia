<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
</script>

<template>
  <div>Page: A</div>

  <Link href="/async-visits/page-b" async>Go to B async</Link>
  <Link href="/async-visits/page-a" async>Go to A async</Link>
  <Link href="/async-visits/page-c">Go to C</Link>
</template>
