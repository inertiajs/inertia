<script setup>
import { router } from '@inertiajs/vue3'

const locationVisit = () => {
  router.visit('/location')
}
</script>

<template>
  <div>
    <span class="text">This is the page that demonstrates location visits</span>

    <span @click="locationVisit" class="example">Location visit</span>
  </div>
</template>
