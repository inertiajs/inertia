<script setup lang="ts">
import { router } from '@inertiajs/vue3'

defineProps<{ message: string; onAction?: () => string }>()

const clientVisit = () => {
  router.push({
    url: '/history/non-serializable/landed',
    component: 'History/NonSerializableTarget',
    props: { message: 'Client visit landed' },
  })
}
</script>

<template>
  <button @click="clientVisit">Client visit</button>

  <div>{{ message }}</div>
</template>
