<script setup lang="ts">
import { router } from '@inertiajs/vue3'

defineProps<{
  config: {
    locale?: string
    timezone: string
  }
}>()
</script>

<template>
  <p id="locale">Locale: {{ config.locale }}</p>
  <p id="timezone">Timezone: {{ config.timezone }}</p>
  <button @click="router.reload()">Reload</button>
  <button @click="router.reload({ only: ['config'] })">Reload only config</button>
</template>
