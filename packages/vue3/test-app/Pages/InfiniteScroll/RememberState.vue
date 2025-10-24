<script setup lang="ts">
import { InfiniteScroll, Link, router } from '@inertiajs/vue3'
import { User, default as UserCard } from './UserCard.vue'

defineProps<{
  users: { data: User[] }
}>()

function prependUser(id: number) {
  router.prependToProp('users.data', { id, name: `User ${id}` })
}
</script>

<template>
  <div style="margin-bottom: 40px; padding: 20px; border-top: 2px solid #ccc">
    <div style="margin-bottom: 20px">
      <button @click.prevent="prependUser(0)" style="margin-right: 10px">Prepend User '0'</button>
      <button @click.prevent="prependUser(-1)" style="margin-right: 10px">Prepend User '-1'</button>
    </div>
    <Link href="/home">Go Home</Link>
  </div>

  <InfiniteScroll data="users" style="display: grid; gap: 20px" :manual-after="2">
    <UserCard v-for="user in users.data" :key="user.id" :user="user" />

    <template #next="{ fetch, manualMode, loading }">
      <p v-if="loading">Loading...</p>

      <p>Manual mode: {{ manualMode }}</p>

      <button v-if="manualMode" @click.prevent="fetch">Load next items...</button>
    </template>
  </InfiniteScroll>

  <div style="margin-top: 40px; padding: 20px; border-top: 2px solid #ccc">
    <Link href="/home">Go to Home</Link>
  </div>
</template>
