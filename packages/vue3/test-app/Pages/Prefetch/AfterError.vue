<script setup lang="ts">
import { router } from '@inertiajs/vue3'

const prefetchPage = () => {
  router.prefetch('/prefetch/swr/1', { method: 'get' }, { cacheFor: 5000 })
}

const visitPage = () => {
  router.visit('/prefetch/swr/1')
}

const prefetchNonInertia = () => {
  router.prefetch('/non-inertia', { method: 'get' }, { cacheFor: 5000 })
}

const visitNonInertia = () => {
  router.visit('/non-inertia')
}
</script>

<template>
  <div>
    <button @click="prefetchPage">Prefetch Page</button>
    <button @click="visitPage">Visit Page</button>
    <button @click="prefetchNonInertia">Prefetch Non-Inertia</button>
    <button @click="visitNonInertia">Visit Non-Inertia</button>
  </div>
</template>
