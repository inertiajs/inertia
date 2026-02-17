<script setup lang="ts">
import { router } from '@inertiajs/vue3'

const visit = () => {
  router.get(
    '/sleep',
    {},
    {
      onStart: () => console.log('started'),
      onCancel: () => console.log('cancelled'),
    },
  )
}
</script>

<template>
  <div>
    <span class="text">This is the page that demonstrates that only one visit can be active at a time</span>
    <a href="#" @click.prevent="visit" class="visit">Link</a>
  </div>
</template>
