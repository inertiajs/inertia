<script setup lang="ts">
import { router } from '@inertiajs/vue3'
import { ref } from 'vue'

defineProps<{ status?: string }>()
;(window as any)._inertia_router = router

const error = ref(false)

function makeRequest() {
  error.value = false
  router.get('/network-error', {}, { onNetworkError: () => (error.value = true) })
}
</script>

<template>
  <div>
    <h1>Network Error</h1>
    <div id="status">{{ status ?? 'idle' }}</div>
    <div v-if="error" id="network-error">Network error occurred</div>
    <button id="make-request" @click="makeRequest">Make Request</button>
  </div>
</template>
