<script setup lang="ts">
import { InfiniteScroll } from '@inertiajs/vue3'
import { User, default as UserCard } from '../InfiniteScroll/UserCard.vue'

defineProps<{
  users: { data: User[] }
}>()
</script>

<template>
  <div>Infinite layer</div>
  <InfiniteScroll data="users" style="display: grid; gap: 20px" manual>
    <template #previous="{ loading, fetch, hasMore }">
      <button @click="fetch">{{ loading ? 'Loading previous items...' : 'Load previous items' }}</button>
      <span>Has more previous: {{ hasMore }}</span>
    </template>

    <UserCard v-for="user in users.data" :key="user.id" :user="user" />

    <template #next="{ loading, fetch, hasMore }">
      <button @click="fetch">{{ loading ? 'Loading next items...' : 'Load next items' }}</button>
      <span>Has more next: {{ hasMore }}</span>
    </template>
  </InfiniteScroll>
</template>
