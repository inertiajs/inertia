<script setup lang="ts">
import { Link, router } from '@inertiajs/vue3'

const visitWithFragment = () => {
  router.visit('/retain-fragment/redirect#my-fragment')
}

const postWithFragment = () => {
  router.post('/retain-fragment/post-redirect', {}, { headers: { 'x-fragment': 'true' } })
}
</script>

<template>
  <div>
    <span id="current-url">{{ $page.url }}</span>

    <Link href="/retain-fragment/redirect#my-fragment" id="link-with-fragment">Link with fragment</Link>

    <a href="#" @click.prevent="visitWithFragment" id="manual-visit-with-fragment">Manual visit with fragment</a>
  </div>
</template>
