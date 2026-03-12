<script setup lang="ts">
import { router } from '@inertiajs/vue3'
import { onMounted, onUnmounted, ref } from 'vue'

const error = ref(false)

let removeListener: () => void

onMounted(() => {
  removeListener = router.on('exception', () => {
    error.value = true
    return false
  })
})

onUnmounted(() => removeListener?.())

function makeRequest() {
  error.value = false
  router.get('/network-error')
}
</script>

<template>
  <div>
    <h1>Network Error</h1>
    <div v-if="error" id="network-error">Network error occurred</div>
    <button id="make-request" @click="makeRequest">Make Request</button>
  </div>
</template>
