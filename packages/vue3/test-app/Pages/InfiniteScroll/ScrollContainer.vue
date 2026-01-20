<script setup lang="ts">
import { InfiniteScroll } from '@inertiajs/vue3'
import { User, default as UserCard } from './UserCard.vue'

defineProps<{
  users: { data: User[] }
}>()
</script>

<template>
  <div style="padding: 20px">
    <h1>Infinite Scroll in Container</h1>
    <p>This component scrolls within a fixed-height container, not the full page.</p>

    <!-- Fixed height scrollable container -->
    <div
      data-testid="scroll-container"
      style="height: 400px; width: 100%; border: 2px solid #ccc; overflow-y: auto; background: #f9f9f9; padding: 10px"
    >
      <InfiniteScroll data="users" style="display: grid; gap: 10px">
        <UserCard v-for="user in users.data" :key="user.id" :user="user" />

        <template #loading>
          <div style="text-align: center; padding: 20px; color: #666">Loading more users...</div>
        </template>
      </InfiniteScroll>
    </div>

    <p style="margin-top: 20px">Content below the scroll container to verify page doesn't scroll.</p>
  </div>
</template>
