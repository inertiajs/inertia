<script setup lang="ts">
import { router } from '@inertiajs/vue3'
import { onMounted } from 'vue'

defineProps({
  name: String,
})

onMounted(() => {
  router.reload({ only: ['name'] })
})
</script>

<template>
  <div>Name is {{ name }}</div>
</template>
