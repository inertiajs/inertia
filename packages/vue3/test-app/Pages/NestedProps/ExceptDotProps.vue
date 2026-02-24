<script setup lang="ts">
import { router } from '@inertiajs/vue3'

defineProps<{
  auth: {
    user: string
    token?: string
    sessionId?: string
  }
}>()
</script>

<template>
  <p id="user">User: {{ auth.user }}</p>
  <p id="token">Token: {{ auth.token }}</p>
  <p id="session-id">Session: {{ auth.sessionId }}</p>
  <button @click="router.reload({ except: ['auth.token'] })">Reload Without Token</button>
  <button @click="router.reload({ except: ['auth.token', 'auth.sessionId'] })">Reload Without Token and Session</button>
</template>
