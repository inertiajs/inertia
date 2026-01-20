<script setup lang="ts">
import { InfiniteScroll } from '@inertiajs/vue3'
import { User, default as UserCard } from './UserCard.vue'

defineProps<{
  users: { data: User[] }
}>()
</script>

<template>
  <div>
    <h1>Empty Dataset Test</h1>
    <InfiniteScroll data="users" style="display: grid; gap: 20px">
      <UserCard v-for="user in users.data" :key="user.id" :user="user" />

      <div v-if="users.data.length === 0" style="text-align: center; padding: 40px; color: #666">No users found.</div>

      <template #loading>
        <div style="text-align: center; padding: 20px">Loading...</div>
      </template>
    </InfiniteScroll>
  </div>
</template>
