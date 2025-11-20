<script setup lang="ts">
import { InfiniteScroll } from '@inertiajs/vue3'
import { ref } from 'vue'
import { User } from './UserCard.vue'

defineProps<{
  users: { data: User[] }
}>()

const tableHeader = ref<HTMLElement>()
const tableFooter = ref<HTMLElement>()
const tableBody = ref<HTMLElement>()
</script>

<template>
  <div style="padding: 20px">
    <h1>Custom Triggers with React Ref Objects Test</h1>

    <InfiniteScroll
      data="users"
      :start-element="() => tableHeader"
      :end-element="() => tableFooter"
      :items-element="() => tableBody"
      #default="{ loadingPrevious, loadingNext }"
    >
      <div style="height: 300px; width: 100%; text-align: center; line-height: 300px; border: 1px solid #ccc">
        Spacer
      </div>

      <table style="width: 100%; border-collapse: collapse">
        <thead ref="tableHeader" style="padding: 10px">
          <tr>
            <th style="padding: 12px; border: 1px solid #ccc">ID</th>
            <th style="padding: 12px; border: 1px solid #ccc">Name</th>
          </tr>
        </thead>

        <tbody ref="tableBody">
          <tr v-for="user in users.data" :key="user.id" :data-user-id="user.id">
            <td style="padding: 80px 12px; border: 1px solid #ccc">{{ user.id }}</td>
            <td style="padding: 80px 12px; border: 1px solid #ccc">{{ user.name }}</td>
          </tr>
          <tr v-if="loadingPrevious || loadingNext">
            <td colspan="2" style="padding: 12px; border: 1px solid #ccc; text-align: center">Loading...</td>
          </tr>
        </tbody>

        <tfoot ref="tableFooter" style="background: #fdf2e8; padding: 10px">
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
