<script setup lang="ts">
import { InfiniteScroll } from '@inertiajs/vue3'
import { ref } from 'vue'
import { User, default as UserCard } from './UserCard.vue'

defineProps<{
  users: { data: User[] }
}>()

const manual = ref(false)
</script>

<template>
  <div>
    <p>
      <label>
        <input type="checkbox" v-model="manual" />
        Manual mode: {{ manual }}
      </label>
    </p>

    <InfiniteScroll data="users" style="display: grid; gap: 20px" :manual="manual">
      <UserCard v-for="user in users.data" :key="user.id" :user="user" />

      <template #loading>
        <div style="text-align: center; padding: 20px">Loading...</div>
      </template>
    </InfiniteScroll>

    <p>Total items on page: {{ users.data.length }}</p>
  </div>
</template>
