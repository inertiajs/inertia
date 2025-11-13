<script setup lang="ts">
import { InfiniteScroll } from '@inertiajs/vue3'
import { User, default as UserCard } from './UserCard.vue'

defineProps<{
  users: { data: User[] }
}>()
</script>

<template>
  <div>
    <h1>Infinite Scroll with Invisible First Child</h1>

    <InfiniteScroll data="users" style="display: grid; gap: 20px">
      <div style="display: none">Hidden first element</div>

      <UserCard v-for="user in users.data" :key="user.id" :user="user" />

      <template #loading>
        <div style="text-align: center; padding: 20px">Loading...</div>
      </template>
    </InfiniteScroll>
  </div>
</template>
