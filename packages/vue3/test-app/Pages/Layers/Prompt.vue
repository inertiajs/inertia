<script setup lang="ts">
import { router } from '@inertiajs/vue3'

const complete = () => {
  router.post('/layers/prompt/complete')
}
</script>

<template>
  <div id="prompt-page">Sudo prompt</div>

  <button @click="complete">Complete the prompt</button>
</template>
