<script setup lang="ts">
import { Deferred, router } from '@inertiajs/vue3'

defineProps<{
  auth: {
    user?: string
    token?: string
    notifications?: string[]
  }
  status: string
}>()
</script>

<template>
  <p id="user">User: {{ auth.user }}</p>
  <p id="token">Token: {{ auth.token }}</p>
  <p id="status">Status: {{ status }}</p>

  <Deferred data="auth.notifications">
    <template #fallback>
      <div id="loading">Loading notifications...</div>
    </template>

    <template #error>
      <button id="reload-except" @click="router.reload({ except: ['auth.notifications'] })">
        Reload without notifications
      </button>
    </template>

    <p id="notifications">Notifications: {{ auth.notifications?.join(', ') }}</p>
  </Deferred>
</template>
