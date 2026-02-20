<script setup lang="ts">
import { Deferred } from '@inertiajs/vue3'

defineProps<{
  auth: {
    user?: { name: string; email: string }
    token?: string
    notifications?: string[]
    roles?: string[]
  }
}>()
</script>

<template>
  <p id="user">User: {{ auth.user?.name }} ({{ auth.user?.email }})</p>
  <p id="token">Token: {{ auth.token }}</p>

  <Deferred :data="['auth.notifications', 'auth.roles']">
    <template #fallback>
      <div id="loading">Loading...</div>
    </template>
    <p id="notifications">Notifications: {{ auth.notifications?.join(', ') }}</p>
    <p id="roles">Roles: {{ auth.roles?.join(', ') }}</p>
  </Deferred>
</template>
