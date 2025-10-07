<script setup lang="ts">
import { InfiniteScroll, usePage } from '@inertiajs/vue3'
import { User, default as UserCard } from './UserCard.vue'

defineProps<{
  users: { data: User[] }
}>()

const page = usePage()

window.testing = {
  ...(window.testing || {}),
  get pageUrl() {
    return page.url
  },
}
</script>

<template>
  <InfiniteScroll data="users" style="display: grid; gap: 20px">
    <UserCard v-for="user in users.data" :key="user.id" :user="user" />

    <template #loading>
      <div style="text-align: center; padding: 20px">Loading...</div>
    </template>
  </InfiniteScroll>
</template>
