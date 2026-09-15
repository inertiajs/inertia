<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const status = ref<'pending' | 'ready'>('pending')
const count = ref(0)

let timer: ReturnType<typeof setTimeout>

onMounted(() => {
  window._inertia_client_only_child_mounts = (window._inertia_client_only_child_mounts || 0) + 1

  timer = setTimeout(() => {
    status.value = 'ready'
  }, 100)
})

onUnmounted(() => {
  clearTimeout(timer)
})
</script>

<template>
  <div>
    <span data-testid="child-status">{{ status }}</span>
    <span data-testid="child-count">{{ count }}</span>
    <button data-testid="child-increment" @click="count++">Increment</button>
  </div>
</template>
