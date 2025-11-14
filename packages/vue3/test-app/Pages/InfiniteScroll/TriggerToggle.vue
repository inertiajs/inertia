<script setup lang="ts">
import { InfiniteScroll } from '@inertiajs/vue3'
import { ref } from 'vue'
import { User, default as UserCard } from './UserCard.vue'

defineProps<{
  users: { data: User[] }
}>()

const triggerMode = ref<'onlyPrevious' | 'onlyNext' | 'both'>('onlyPrevious')
</script>

<template>
  <div>
    <p>
      <label>
        <select v-model="triggerMode">
          <option value="onlyPrevious">onlyPrevious</option>
          <option value="onlyNext">onlyNext</option>
          <option value="both">both</option>
        </select>
        Trigger mode: {{ triggerMode }}
      </label>
    </p>

    <InfiniteScroll
      data="users"
      style="display: grid; gap: 20px"
      :only-next="triggerMode === 'onlyNext'"
      :only-previous="triggerMode === 'onlyPrevious'"
    >
      <UserCard v-for="user in users.data" :key="user.id" :user="user" />

      <template #loading>
        <div style="text-align: center; padding: 20px">Loading...</div>
      </template>
    </InfiniteScroll>

    <p>Total items on page: {{ users.data.length }}</p>
  </div>
</template>
