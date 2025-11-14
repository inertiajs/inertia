<script setup lang="ts">
import { InfiniteScroll } from '@inertiajs/vue3'
import { User, default as UserCard } from './UserCard.vue'

defineProps<{
  users1: { data: User[] }
  users2: { data: User[] }
}>()
</script>

<template>
  <div style="padding: 20px">
    <div style="display: flex; gap: 20px">
      <!-- First scroll container -->
      <div style="flex: 1">
        <h2>Users1 Container</h2>
        <div
          data-testid="scroll-container-1"
          style="
            height: 400px;
            width: 100%;
            border: 2px solid #3b82f6;
            overflow-y: auto;
            background: #f0f9ff;
            padding: 10px;
          "
        >
          <InfiniteScroll data="users1" style="display: grid; gap: 10px">
            <UserCard v-for="user in users1.data" :key="user.id" :user="user" />

            <template #loading>
              <div style="text-align: center; padding: 20px; color: #3b82f6">Loading more users1...</div>
            </template>
          </InfiniteScroll>
        </div>
      </div>

      <!-- Second scroll container -->
      <div style="flex: 1">
        <h2>Users2 Container</h2>
        <div
          data-testid="scroll-container-2"
          style="
            height: 400px;
            width: 100%;
            border: 2px solid #ef4444;
            overflow-y: auto;
            background: #fef2f2;
            padding: 10px;
          "
        >
          <InfiniteScroll data="users2" style="display: grid; gap: 10px">
            <UserCard v-for="user in users2.data" :key="user.id" :user="user" />

            <template #loading>
              <div style="text-align: center; padding: 20px; color: #ef4444">Loading more users2...</div>
            </template>
          </InfiniteScroll>
        </div>
      </div>
    </div>

    <p style="margin-top: 20px">Content below the scroll containers to verify page doesn't scroll.</p>
  </div>
</template>
