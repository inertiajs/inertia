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
  <InfiniteScroll data="users" style="display: grid; gap: 20px" reverse only-next>
    <template #previous="{ fetch, hasMore }">
      <button v-if="hasMore" @click="fetch" style="padding: 10px 20px; font-size: 16px; cursor: pointer">
        Load previous page (rendered at the end because of reverse mode)
      </button>
    </template>

    <UserCard v-for="user in reversedUsers" :key="user.id" :user="user" />

    <template #next="{ fetch, hasMore }">
      <button @click="fetch" style="padding: 10px 20px; font-size: 16px; cursor: pointer" v-if="hasMore">
        Load next page (rendered at the start because of reverse mode)
      </button>
    </template>
  </InfiniteScroll>
</template>
