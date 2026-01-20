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
    <h1>Dual Sibling InfiniteScroll</h1>
    <p style="margin-bottom: 20px">Two InfiniteScroll components side by side, sharing the window scroll</p>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px">
      <div>
        <h2>Users 1</h2>
        <InfiniteScroll data="users1" style="display: grid; gap: 20px" manual>
          <UserCard v-for="user in users1.data" :key="user.id" :user="user" />

          <template #next="{ loading, fetch }">
            <div style="text-align: center; padding: 20px">
              <button @click="fetch" :disabled="loading">
                {{ loading ? 'Loading...' : 'Load More Users 1' }}
              </button>
            </div>
          </template>
        </InfiniteScroll>
      </div>

      <div>
        <h2>Users 2</h2>
        <InfiniteScroll data="users2" style="display: grid; gap: 20px" manual>
          <UserCard v-for="user in users2.data" :key="user.id" :user="user" />

          <template #next="{ loading, fetch }">
            <div style="text-align: center; padding: 20px">
              <button @click="fetch" :disabled="loading">
                {{ loading ? 'Loading...' : 'Load More Users 2' }}
              </button>
            </div>
          </template>
        </InfiniteScroll>
      </div>
    </div>
  </div>
</template>
