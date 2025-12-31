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

    <InfiniteScroll data="users" style="display: grid; gap: 20px" manual>
      <template #previous="{ loading, fetch, hasMore }">
        <p>Has more previous items: {{ hasMore }}</p>

        <button @click="fetch">
          {{ loading ? 'Loading previous items...' : 'Load previous items' }}
        </button>
      </template>

      <UserCard v-for="user in users.data" :key="user.id" :user="user" />

      <template #next="{ loading, fetch, hasMore }">
        <p>Has more next items: {{ hasMore }}</p>

        <button @click="fetch">
          {{ loading ? 'Loading next items...' : 'Load next items' }}
        </button>
      </template>
    </InfiniteScroll>
  </div>
</template>
