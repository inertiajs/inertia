<script setup lang="ts">
import { InfiniteScroll, Link, useForm } from '@inertiajs/vue3'
import { debounce } from 'lodash-es'
import { watch } from 'vue'
import { User, default as UserCard } from './UserCard.vue'

const props = defineProps<{
  users: { data: User[] }
  preserveState: boolean
  filter?: string
  search?: string
}>()

const form = useForm({
  filter: undefined,
  page: undefined,
  search: props.search,
})

watch(
  () => form.search,
  debounce(
    () =>
      form.get(
        '',
        props.preserveState
          ? {
              preserveState: true,
              replace: true,
              only: ['users', 'search', 'filter'],
              reset: ['users'],
            }
          : {
              replace: true,
            },
      ),
    250,
  ),
)
</script>

<template>
  <div>
    <div style="margin-bottom: 20px; display: flex; gap: 10px">
      <Link href=""> No Filter </Link>
      <Link href="?filter=a-m"> A-M </Link>
      <Link href="?filter=n-z"> N-Z </Link>
      <div>Current filter: {{ filter || 'none' }}</div>
      <div>Current search: {{ search || 'none' }}</div>
      <input v-model="form.search" placeholder="Search..." />
    </div>

    <InfiniteScroll data="users" style="display: grid; gap: 20px">
      <UserCard v-for="user in users.data" :key="user.id" :user="user" />

      <template #loading>
        <div style="text-align: center; padding: 20px">Loading...</div>
      </template>
    </InfiniteScroll>

    <div style="margin-top: 20px; display: flex; gap: 10px">
      <Link href=""> No Filter </Link>
      <Link href="?filter=a-m"> A-M </Link>
      <Link href="?filter=n-z"> N-Z </Link>
      <div>Current filter: {{ filter || 'none' }}</div>
      <div>Current search: {{ search || 'none' }}</div>
      <input v-model="form.search" placeholder="Search..." />
    </div>
  </div>
</template>
