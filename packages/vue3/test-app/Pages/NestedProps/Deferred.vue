<script setup lang="ts">
import { Deferred } from '@inertiajs/vue3'

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
    <p id="notifications">Notifications: {{ auth.notifications?.join(', ') }}</p>
  </Deferred>
</template>
