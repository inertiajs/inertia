<script setup lang="ts">
import { InfiniteScroll } from '@inertiajs/vue3'
import { User } from './UserCard.vue'

defineProps<{
  users: { data: User[] }
}>()
</script>

<template>
  <div style="padding: 20px">
    <h1>Custom Triggers with Selectors Test</h1>

    <InfiniteScroll
      data="users"
      items-element="#table-body"
      start-element="#table-header"
      end-element="#table-footer"
      #default="{ loadingPrevious, loadingNext }"
    >
      <div style="height: 300px; width: 100%; text-align: center; line-height: 300px; border: 1px solid #ccc">
        Spacer
      </div>

      <table style="width: 100%; border-collapse: collapse">
        <thead id="table-header" style="padding: 12px">
          <tr>
            <th style="padding: 12px; border: 1px solid #ccc">ID</th>
            <th style="padding: 12px; border: 1px solid #ccc">Name</th>
          </tr>
        </thead>

        <tbody id="table-body">
          <tr v-for="user in users.data" :key="user.id" :data-user-id="user.id">
            <td style="padding: 80px 12px; border: 1px solid #ccc">{{ user.id }}</td>
            <td style="padding: 80px 12px; border: 1px solid #ccc">{{ user.name }}</td>
          </tr>

          <tr v-if="loadingPrevious || loadingNext">
            <td colspan="2" style="padding: 12px; border: 1px solid #ccc; text-align: center">Loading...</td>
          </tr>
        </tbody>

        <tfoot id="table-footer" style="padding: 12px">
          <tr>
            <td colspan="2" style="padding: 12px; border: 1px solid #ccc; text-align: center">
              Table Footer - Triggers when this comes into view
            </td>
          </tr>
        </tfoot>
      </table>

      <div style="height: 300px; width: 100%; text-align: center; line-height: 300px; border: 1px solid #ccc">
        Spacer
      </div>
    </InfiniteScroll>
  </div>
</template>
