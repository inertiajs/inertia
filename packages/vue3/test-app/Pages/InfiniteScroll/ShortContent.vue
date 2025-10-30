<script setup lang="ts">
import { InfiniteScroll } from '@inertiajs/vue3'
import { User } from './UserCard.vue'

defineProps<{
  users: { data: User[] }
}>()
</script>

<template>
  <InfiniteScroll data="users" items-element="tbody">
    <table style="width: 100%; border-collapse: collapse">
      <tbody>
        <tr v-for="user in users.data" :key="user.id" :data-user-id="user.id">
          <td style="padding: 10px; border: 1px solid #ccc">{{ user.id }}</td>
          <td style="padding: 10px; border: 1px solid #ccc">{{ user.name }}</td>
        </tr>
      </tbody>
    </table>
  </InfiniteScroll>
</template>
