<script setup>
import { router } from '@inertiajs/vue3'

const prefetchPage = () => {
  router.prefetch('/prefetch/swr/1', { method: 'get' }, { cacheFor: 5000 })
}

const visitPage = () => {
  router.visit('/prefetch/swr/1')
}
</script>

<template>
  <div>
    <button @click="prefetchPage">Prefetch Page</button>
    <button @click="visitPage">Visit Page</button>
  </div>
</template>
