<script setup lang="ts">
import { router } from '@inertiajs/vue3'

const signIn = () => {
  router.post('/layers/login')
}
</script>

<template>
  <div id="login-page">Sign in to continue</div>

  <button @click="signIn">Sign in</button>
</template>
