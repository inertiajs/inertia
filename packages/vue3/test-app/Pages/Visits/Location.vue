<script setup>
import { router } from '@inertiajs/vue3'

const locationVisit = (e) => {
  e.preventDefault()
  router.visit('/location')
}
</script>

<template>
  <div>
    <span class="text">This is the page that demonstrates location visits</span>

    <a href="#" @click="locationVisit" class="example">Location visit</a>
  </div>
</template>
