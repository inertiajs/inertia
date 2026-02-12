<script setup lang="ts">
import { InfiniteScroll, router, usePage } from '@inertiajs/vue3'
import { ref } from 'vue'

defineProps<{
  users: {
    data: { id: number; name: string }[]
  }
}>()

const page = usePage()
const flashEventCount = ref(0)

router.on('flash', () => {
  flashEventCount.value++
})
</script>

<template>
  <div>
    <span id="flash">{{ JSON.stringify(page.flash) }}</span>
    <span id="flash-event-count">{{ flashEventCount }}</span>

    <InfiniteScroll data="users" style="display: grid; gap: 20px">
      <div v-for="user in users.data" :key="user.id" style="height: 15vh; border: 1px solid #ccc">
        {{ user.name }}
      </div>
    </InfiniteScroll>
  </div>
</template>
