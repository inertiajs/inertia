<script setup lang="ts">
import { InfiniteScroll } from '@inertiajs/vue3'
import { User } from './UserCard.vue'

defineProps<{
  users: { data: User[] }
}>()
</script>

<template>
  <div style="height: 120px; overflow-x: scroll; display: flex; width: 100vw">
    <InfiniteScroll data="users" style="display: flex; gap: 20px; height: 120px">
      <div
        v-for="user in users.data"
        :key="user.id"
        :data-user-id="user.id"
        style="
          min-width: 200px;
          height: 100px;
          border: 1px solid #ccc;
          background-color: #f5f5f5;
          display: flex;
          align-items: center;
          justify-content: center;
          flex: none;
        "
      >
        {{ user.name }}
      </div>

      <template #loading>
        <div
          style="
            min-width: 150px;
            height: 100px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px dashed #ccc;
            margin-left: 20px;
            margin-right: 20px;
          "
        >
          Loading...
        </div>
      </template>
    </InfiniteScroll>
  </div>
</template>
