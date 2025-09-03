<script setup lang="ts">
import { InfiniteScroll } from '@inertiajs/vue3'
import { User, default as UserCard } from './UserCard.vue'

defineProps<{
  users: { data: User[] }
}>()
</script>

<template>
  <InfiniteScroll data="users" :preserveUrl="true" style="display: grid; gap: 20px">
    <UserCard v-for="user in users.data" :key="user.id" :user="user" />

    <template #loading>
      <div style="text-align: center; padding: 20px">Loading...</div>
    </template>
  </InfiniteScroll>
</template>
