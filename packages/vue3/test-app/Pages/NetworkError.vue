<script setup lang="ts">
import { router } from '@inertiajs/vue3'

defineProps<{ status?: string }>()
</script>

<template>
  <div>
    <h1>Network Error</h1>
    <div id="status">{{ status ?? 'idle' }}</div>
    <button id="make-request" @click="router.get('/network-error')">Make Request</button>
  </div>
</template>
