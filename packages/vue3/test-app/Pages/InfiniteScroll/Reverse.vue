<script setup lang="ts">
import { InfiniteScroll } from '@inertiajs/vue3'
import { computed } from 'vue'
import { User, default as UserCard } from './UserCard.vue'

const props = defineProps<{
  users: { data: User[] }
}>()

const reversedUsers = computed(() => [...props.users.data].reverse())
</script>

<template>
  <InfiniteScroll data="users" style="display: grid; gap: 20px" reverse :auto-scroll="false">
    <UserCard v-for="user in reversedUsers" :key="user.id" :user="user" />

    <template #loading>
      <div style="text-align: center; padding: 20px">Loading...</div>
    </template>
  </InfiniteScroll>
</template>
