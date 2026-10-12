<script setup lang="ts">
import { InfiniteScroll, Link } from '@inertiajs/vue3'
import { User, default as UserCard } from './UserCard.vue'

defineProps<{
  users: { data: User[] }
}>()
</script>

<template>
  <div>
    <Link href="/article" id="leave">Leave to /article</Link>
    <Link href="/infinite-scroll/navigate-away/slow-article" id="leave-slowly">Leave slowly to /article</Link>
    <Link href="/infinite-scroll/navigate-away?order=desc" id="sort-slowly">Slowly sort descending</Link>
    <InfiniteScroll data="users" style="display: grid; gap: 20px">
      <UserCard v-for="user in users.data" :key="user.id" :user="user" />

      <template #loading>
        <div style="text-align: center; padding: 20px">Loading...</div>
      </template>
    </InfiniteScroll>
  </div>
</template>
