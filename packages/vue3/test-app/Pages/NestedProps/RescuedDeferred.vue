<script setup lang="ts">
import { Deferred, router } from '@inertiajs/vue3'

defineProps<{
  auth: {
    user?: string
    notifications?: string[]
  }
}>()
</script>

<template>
  <p id="user">User: {{ auth.user }}</p>

  <Deferred data="auth.notifications">
    <template #fallback>
      <div id="loading">Loading notifications...</div>
    </template>

    <template #rescue>
      <button id="retry" @click="router.reload({ only: ['auth'] })">Retry auth</button>
    </template>

    <p id="notifications">Notifications: {{ auth.notifications?.join(', ') }}</p>
  </Deferred>
</template>
