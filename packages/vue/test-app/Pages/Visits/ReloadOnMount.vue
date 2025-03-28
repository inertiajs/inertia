<script setup>
import { router } from '@inertiajs/vue'
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
