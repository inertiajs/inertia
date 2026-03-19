<script setup lang="ts">
import { InfiniteScroll } from '@inertiajs/vue3'

defineProps<{
  users: { data: { id: number; name: string }[] }
}>()
</script>

<template>
  <div>
    <h1 data-testid="ssr-title">SSR Infinite Scroll</h1>

    <InfiniteScroll data="users" manual>
      <template #previous="{ hasMore }">
        <p data-testid="has-previous">Has previous: {{ hasMore }}</p>
      </template>

      <div v-for="user in users.data" :key="user.id" data-testid="user">
        {{ user.name }}
      </div>

      <template #next="{ hasMore }">
        <p data-testid="has-next">Has next: {{ hasMore }}</p>
      </template>
    </InfiniteScroll>
  </div>
</template>
