<script setup lang="ts">
import { InfiniteScroll, Link } from '@inertiajs/vue3'
import { User, default as UserCard } from '../InfiniteScroll/UserCard.vue'

defineProps<{
  term: string | null
  users: { data: User[] }
}>()
</script>

<template>
  <div>
    <p id="term">Term: {{ term ?? 'nothing' }}</p>

    <Link method="query" href="/query-visits/infinite-scroll" :data="{ term: 'Apple' }">Search Apple</Link>

    <InfiniteScroll data="users" style="display: grid; gap: 20px" manual>
      <UserCard v-for="user in users.data" :key="user.id" :user="user" />

      <template #next="{ loading, fetch, hasMore }">
        <p>Has more next items: {{ hasMore }}</p>

        <button @click="fetch">
          {{ loading ? 'Loading next items...' : 'Load next items' }}
        </button>
      </template>
    </InfiniteScroll>
  </div>
</template>
