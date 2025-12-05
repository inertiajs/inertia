<script setup lang="ts">
import { router } from '@inertiajs/vue3'

const submitWithRedirectBack = () => {
  router.post(
    '/redirect-back/submit',
    {},
    {
      redirectBack: true,
    },
  )
}

const submitWithoutRedirectBack = () => {
  router.post('/redirect-back/submit')
}
</script>

<template>
  <div>
    <p>This is the page that demonstrates the redirectBack option</p>

    <button @click="submitWithRedirectBack">Submit with redirectBack</button>
    <button @click="submitWithoutRedirectBack">Submit without redirectBack</button>
  </div>
</template>
