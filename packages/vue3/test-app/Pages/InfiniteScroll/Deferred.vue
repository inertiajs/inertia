<script setup lang="ts">
import { Deferred, InfiniteScroll } from '@inertiajs/vue3'
import { User, default as UserCard } from './UserCard.vue'

defineProps<{
  users?: { data: User[] }
}>()
</script>

<template>
  <Deferred data="users">
    <template #fallback>
      <div>Loading deferred scroll prop...</div>
    </template>

    <InfiniteScroll data="users" style="display: grid; gap: 20px" manual>
      <template #previous="{ loading, fetch, hasMore }">
        <p>Has more previous items: {{ hasMore }}</p>

        <button @click="fetch">
          {{ loading ? 'Loading previous items...' : 'Load previous items' }}
        </button>
      </template>

      <UserCard v-for="user in users!.data" :key="user.id" :user="user" />

      <template #next="{ loading, fetch, hasMore }">
        <p>Has more next items: {{ hasMore }}</p>

        <button @click="fetch">
          {{ loading ? 'Loading next items...' : 'Load next items' }}
        </button>
      </template>
    </InfiniteScroll>
  </Deferred>
</template>
