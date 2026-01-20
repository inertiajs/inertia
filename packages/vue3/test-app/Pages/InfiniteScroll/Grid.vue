<script setup lang="ts">
import { InfiniteScroll } from '@inertiajs/vue3'
import { User, default as UserCard } from './UserCard.vue'

defineProps<{
  users: { data: User[] }
}>()
</script>

<template>
  <InfiniteScroll data="users" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px">
    <UserCard v-for="user in users.data" :key="user.id" :user="user" />

    <template #loading>
      <div style="grid-column: 1 / -1; text-align: center; padding: 20px">Loading more users...</div>
    </template>
  </InfiniteScroll>
</template>
