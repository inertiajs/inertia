<script setup lang="ts">
import { InfiniteScroll, router } from '@inertiajs/vue3'
import { nextTick, ref } from 'vue'
import { User, default as UserCard } from './UserCard.vue'

const props = defineProps<{
  users: { data: User[] }
}>()

const show = ref(true)
const items = ref<User[]>([...props.users.data])

async function addUserAndUnmount() {
  items.value.push({ id: 1000, name: 'Added User' })
  await nextTick()
  show.value = false
}

async function addUserAndVisitHome() {
  items.value.push({ id: 1000, name: 'Added User' })
  await nextTick()
  router.visit('/')
}
</script>

<template>
  <div>
    <button @click="addUserAndUnmount">Add User and Unmount</button>
    <button @click="addUserAndVisitHome">Add User and Visit Home</button>
    <p id="status">Mounted: {{ show }}</p>

    <InfiniteScroll v-if="show" data="users" style="display: grid; gap: 20px">
      <UserCard v-for="user in items" :key="user.id" :user="user" />
    </InfiniteScroll>
  </div>
</template>
