<script setup lang="ts">
import { Link, router } from '@inertiajs/vue3'

const visitWithFragment = () => {
  router.visit('/preserve-fragment/redirect#my-fragment')
}
</script>

<template>
  <div>
    <span id="current-url">{{ $page.url }}</span>

    <Link href="/preserve-fragment/redirect#my-fragment" id="link-with-fragment">Link with fragment</Link>

    <a href="#" @click.prevent="visitWithFragment" id="manual-visit-with-fragment">Manual visit with fragment</a>
  </div>
</template>
