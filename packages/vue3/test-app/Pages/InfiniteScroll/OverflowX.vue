<script setup lang="ts">
import { InfiniteScroll } from '@inertiajs/vue3'
import { User } from './UserCard.vue'

defineProps<{
  users: { data: User[] }
}>()
</script>

<template>
  <div style="overflow-x: hidden">
    <InfiniteScroll data="users">
      <div v-for="user in users.data" :key="user.id" :data-user-id="user.id">
        <div>{{ user.name }}</div>
      </div>
    </InfiniteScroll>
  </div>
</template>
