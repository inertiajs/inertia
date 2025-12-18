<script lang="ts">
import Layout from '@/Layouts/FlashLayout.vue'

export default {
  layout: Layout,
}
</script>

<script setup lang="ts">
import { usePage } from '@inertiajs/vue3'

const page = usePage()
</script>

<template>
  <div>
    <span class="text">Page Two</span>
    <span class="flash">{{ JSON.stringify(page.flash) }}</span>
  </div>
</template>
