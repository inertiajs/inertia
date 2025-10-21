<script setup lang="ts">
import { InfiniteScroll } from '@inertiajs/vue3'
import { onMounted, ref } from 'vue'
import { User, default as UserCard } from './UserCard.vue'

defineProps<{
  users: { data: User[] }
}>()

const infRef = ref()
const hasPrevious = ref(false)
const hasNext = ref(false)

const updateStates = () => {
  hasPrevious.value = infRef.value.hasPrevious()
  hasNext.value = infRef.value.hasNext()
}

const fetchNext = async () => {
  infRef.value.fetchNext({ onFinish: updateStates })
}

const fetchPrevious = async () => {
  infRef.value.fetchPrevious({ onFinish: updateStates })
}

onMounted(updateStates)
</script>

<template>
  <div>
    <h1>Programmatic Ref Test</h1>

    <div style="margin-bottom: 20px">
      <p>Has more previous items: {{ hasPrevious }}</p>
      <p>Has more next items: {{ hasNext }}</p>

      <div style="display: flex; gap: 10px; margin: 10px 0">
        <button @click="fetchPrevious">Load Previous (Ref)</button>
        <button @click="fetchNext">Load Next (Ref)</button>
      </div>
    </div>

    <InfiniteScroll ref="infRef" data="users" style="display: grid; gap: 20px" manual>
      <template #loading>
        <div style="text-align: center; padding: 20px">Loading...</div>
      </template>

      <UserCard v-for="user in users.data" :key="user.id" :user="user" />
    </InfiniteScroll>

    <p>Total items on page: {{ users.data.length }}</p>
  </div>
</template>
