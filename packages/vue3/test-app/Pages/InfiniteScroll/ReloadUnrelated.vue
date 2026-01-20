<script setup lang="ts">
import { InfiniteScroll, router } from '@inertiajs/vue3'
import UserCard, { User } from './UserCard.vue'

defineProps<{
  users: { data: User[] }
  time: number
}>()

const reloadTime = () => {
  router.reload({ only: ['time'] })
}
</script>

<template>
  <div>
    <div>
      <button @click="reloadTime" id="reload-button">Reload Time</button>
      <span id="time-display">Current time: {{ time }}</span>
    </div>

    <InfiniteScroll data="users">
      <UserCard v-for="user in users.data" :key="user.id" :user="user" />
    </InfiniteScroll>
  </div>
</template>
