<script setup lang="ts">
import { router } from '@inertiajs/vue3'

defineProps<{
  auth: {
    user: {
      name: string
      email: string
      permissions?: string[]
    }
  }
}>()
</script>

<template>
  <p id="name">Name: {{ auth.user.name }}</p>
  <p id="email">Email: {{ auth.user.email }}</p>
  <p id="permissions">Permissions: {{ auth.user.permissions?.join(', ') }}</p>
  <button @click="router.reload({ only: ['auth.user.permissions'] })">Reload Permissions</button>
</template>
