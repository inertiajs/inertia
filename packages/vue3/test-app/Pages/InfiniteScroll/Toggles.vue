<script setup lang="ts">
import { InfiniteScroll } from '@inertiajs/vue3'
import { ref } from 'vue'
import { User, default as UserCard } from './UserCard.vue'

defineProps<{
  users: { data: User[] }
}>()

const manual = ref(false)
const preserveUrl = ref(false)
const trigger = ref<'start' | 'end' | 'both'>('end')
</script>

<template>
  <div>
    <div style="display: flex; gap: 10px">
      <p>
        <label>
          <input type="checkbox" v-model="manual" />
          Manual mode: {{ manual }}
        </label>
      </p>

      <p>
        <label>
          <input type="checkbox" v-model="preserveUrl" />
          Preserve URL: {{ preserveUrl }}
        </label>
      </p>

      <p>
        <label>
          Trigger: {{ trigger }}
          <select v-model="trigger">
            <option value="start">start</option>
            <option value="end">end</option>
            <option value="both">both</option>
          </select>
        </label>
      </p>
    </div>

    <InfiniteScroll
      data="users"
      style="display: grid; gap: 20px"
      :manual="manual"
      :preserve-url="preserveUrl"
      :only-next="trigger === 'end'"
      :only-previous="trigger === 'start'"
    >
      <UserCard v-for="user in users.data" :key="user.id" :user="user" />

      <template #loading>
        <div style="text-align: center; padding: 20px">Loading...</div>
      </template>
    </InfiniteScroll>

    <p>Total items on page: {{ users.data.length }}</p>
  </div>
</template>
