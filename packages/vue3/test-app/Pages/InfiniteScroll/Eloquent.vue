<script setup lang="ts">
import { InfiniteScroll } from '@inertiajs/vue3'

const props = defineProps({
  users: Object,
})
</script>

<template>
  <div id="InfiniteScrollDemo">
    <InfiniteScroll
      as="main"
      data="users"
      style="display: grid; grid-template-columns: 2fr 2fr; gap: 20px"
      #default="{ data: users }"
    >
      <div v-for="user in users" :key="user.id" style="padding: 20px; border: 1px solid #ccc">User {{ user.id }}</div>
    </InfiniteScroll>
  </div>
</template>
