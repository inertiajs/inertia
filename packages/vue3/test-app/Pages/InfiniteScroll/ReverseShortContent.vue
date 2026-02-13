<script setup lang="ts">
import { InfiniteScroll } from '@inertiajs/vue3'
import { computed } from 'vue'

const props = defineProps<{
  users: { data: { id: number; name: string }[] }
}>()

const reversedUsers = computed(() => [...props.users.data].reverse())
</script>

<template>
  <div style="display: flex; flex-direction: column; height: 100vh">
    <div style="padding: 10px; border-bottom: 1px solid #ccc; flex-shrink: 0">Header</div>

    <div data-testid="scroll-container" style="flex: 1; overflow-y: auto">
      <InfiniteScroll data="users" style="display: grid; gap: 4px; padding: 20px" reverse>
        <div
          v-for="user in reversedUsers"
          :key="user.id"
          :data-user-id="user.id"
          style="padding: 4px 8px; border: 1px solid #ddd; font-size: 13px"
        >
          {{ user.name }}
        </div>

        <template #loading>
          <div style="text-align: center; padding: 10px">Loading...</div>
        </template>
      </InfiniteScroll>
    </div>

    <div style="padding: 10px; border-top: 1px solid #ccc; flex-shrink: 0">Footer</div>
  </div>
</template>
