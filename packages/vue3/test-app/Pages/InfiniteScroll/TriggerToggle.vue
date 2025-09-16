<script setup lang="ts">
import { InfiniteScroll } from '@inertiajs/vue3'
import { ref } from 'vue'
import { User, default as UserCard } from './UserCard.vue'

defineProps<{
  users: { data: User[] }
}>()

const trigger = ref<'start' | 'end' | 'both'>('start')
</script>

<template>
  <div>
    <p>
      <label>
        <select v-model="trigger">
          <option value="start">start</option>
          <option value="end">end</option>
          <option value="both">both</option>
        </select>
        Trigger: {{ trigger }}
      </label>
    </p>

    <InfiniteScroll data="users" style="display: grid; gap: 20px" :trigger="trigger">
      <UserCard v-for="user in users.data" :key="user.id" :user="user" />

      <template #loading>
        <div style="text-align: center; padding: 20px">Loading...</div>
      </template>
    </InfiniteScroll>

    <p>Total items on page: {{ users.data.length }}</p>
  </div>
</template>
