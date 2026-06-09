<script setup lang="ts">
import { router } from '@inertiajs/vue3'
import { ref } from 'vue'

const lastNavigateCached = ref<string>('none')

router.on('navigate', (event) => {
  lastNavigateCached.value = String(event.detail.cached)
})
</script>

<template>
  <div>
    Last navigate cached: <span id="last-navigate-cached">{{ lastNavigateCached }}</span>
  </div>

  <slot />
</template>
