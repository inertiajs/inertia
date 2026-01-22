<script setup lang="ts">
import { InfiniteScroll, useForm } from '@inertiajs/vue3'
import { debounce } from 'lodash-es'
import { watch } from 'vue'
import { User, default as UserCard } from './UserCard.vue'

const props = defineProps<{
  users: { data: User[] }
  search?: string
}>()

const form = useForm({
  search: props.search,
})

watch(
  () => form.search,
  debounce(
    () =>
      form.get('', {
        preserveState: true,
        replace: true,
        only: ['users', 'search'],
        reset: ['users'],
      }),
    250,
  ),
)
</script>

<template>
  <div>
    <div style="margin-bottom: 20px; display: flex; gap: 10px">
      <div>Current search: {{ search || 'none' }}</div>
      <input v-model="form.search" placeholder="Search..." />
    </div>

    <InfiniteScroll data="users" :buffer="2000" style="display: grid; gap: 20px">
      <UserCard v-for="user in users.data" :key="user.id" :user="user" />

      <template #loading>
        <div style="text-align: center; padding: 20px">Loading...</div>
      </template>
    </InfiniteScroll>
  </div>
</template>
