<script setup lang="ts">
import { InfiniteScroll, Link } from '@inertiajs/vue3'
import { User, default as UserCard } from './UserCard.vue'

defineProps<{
  users: { data: User[] }
}>()
</script>

<template>
  <InfiniteScroll data="users" style="display: grid; gap: 20px" :manual-after="2">
    <UserCard v-for="user in users.data" :key="user.id" :user="user" />

    <template #next="{ fetch, manualMode, loading }">
      <p v-if="loading">Loading...</p>

      <p>Manual mode: {{ manualMode }}</p>

      <button v-if="manualMode" @click="fetch">Load next items...</button>
    </template>
  </InfiniteScroll>

  <div style="margin-top: 40px; padding: 20px; border-top: 2px solid #ccc">
    <Link href="/home">Go to Home</Link>
  </div>
</template>
