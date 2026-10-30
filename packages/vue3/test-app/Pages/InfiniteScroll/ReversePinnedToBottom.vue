<script setup lang="ts">
import { InfiniteScroll } from '@inertiajs/vue3'
import { computed, onBeforeUnmount, onMounted, useTemplateRef } from 'vue'

const props = defineProps<{
  users: { data: { id: number; name: string }[] }
}>()

const reversedUsers = computed(() => [...props.users.data].reverse())

const container = useTemplateRef('container')

// Pins the container to its bottom whenever its content changes, the way a chat transcript follows its newest message
const observer = new MutationObserver(() => {
  container.value!.scrollTop = container.value!.scrollHeight - container.value!.clientHeight
})

onMounted(() => observer.observe(container.value!, { childList: true, subtree: true }))
onBeforeUnmount(() => observer.disconnect())
</script>

<template>
  <div style="display: flex; flex-direction: column; height: 100vh">
    <div ref="container" data-testid="scroll-container" style="flex: 1; overflow-y: auto">
      <InfiniteScroll data="users" style="display: grid; gap: 4px; padding: 20px" reverse>
        <div
          v-for="user in reversedUsers"
          :key="user.id"
          :data-user-id="user.id"
          style="height: 20.25px; border: 1px solid #ddd; font-size: 13px"
        >
          {{ user.name }}
        </div>
      </InfiniteScroll>
    </div>
  </div>
</template>
