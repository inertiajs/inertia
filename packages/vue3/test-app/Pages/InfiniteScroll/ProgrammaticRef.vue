<script setup lang="ts">
import { InfiniteScroll } from '@inertiajs/vue3'
import { onMounted, ref } from 'vue'
import { User, default as UserCard } from './UserCard.vue'

const props = defineProps<{
  users: { data: User[] }
}>()

const infRef = ref()
const hasMoreBefore = ref(false)
const hasMoreAfter = ref(false)

const updateStates = () => {
  hasMoreBefore.value = infRef.value.hasMoreBefore()
  hasMoreAfter.value = infRef.value.hasMoreAfter()
}

const loadNext = async () => {
  infRef.value.loadAfter({ onFinish: updateStates })
}

const loadPrevious = async () => {
  infRef.value.loadBefore({ onFinish: updateStates })
}

onMounted(updateStates)
</script>

<template>
  <div>
    <h1>Programmatic Ref Test</h1>

    <div style="margin-bottom: 20px">
      <p>Has more previous items: {{ hasMoreBefore }}</p>
      <p>Has more next items: {{ hasMoreAfter }}</p>

      <div style="display: flex; gap: 10px; margin: 10px 0">
        <button @click="loadPrevious">Load Previous (Ref)</button>
        <button @click="loadNext">Load Next (Ref)</button>
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
