<script lang="ts">
import Layout from '@/Layouts/FlashLayout.vue'

export default {
  layout: Layout,
}
</script>

<script setup lang="ts">
import { router } from '@inertiajs/vue3'
</script>

<template>
  <div>
    <span class="text">Page One</span>
    <button class="submit" @click="router.post('/flash/redirect/submit')">Submit</button>
  </div>
</template>
