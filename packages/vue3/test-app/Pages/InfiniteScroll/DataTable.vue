<script setup lang="ts">
import { InfiniteScroll } from '@inertiajs/vue3'
import { User } from './UserCard.vue'

defineProps<{
  users: { data: User[] }
}>()
</script>

<template>
  <InfiniteScroll data="users" items-element="tbody" #default="{ loadingPrevious, loadingNext }">
    <table style="width: 100%; border-collapse: collapse">
      <thead>
        <tr>
          <th style="padding: 8px; border: 1px solid #ccc">ID</th>
          <th style="padding: 8px; border: 1px solid #ccc">Name</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="user in users.data" :key="user.id" :data-user-id="user.id">
          <td style="padding: 8px; border: 1px solid #ccc">{{ user.id }}</td>
          <td style="padding: 8px; border: 1px solid #ccc">{{ user.name }}</td>
        </tr>
      </tbody>

      <tfoot>
        <tr v-if="loadingPrevious || loadingNext">
          <td :colspan="2" style="padding: 8px; border: 1px solid #ccc; text-align: center">Loading...</td>
        </tr>
      </tfoot>
    </table>
  </InfiniteScroll>
</template>
