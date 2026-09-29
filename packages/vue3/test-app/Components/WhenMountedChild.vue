<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { counts } from './whenMountedCounts'

counts.childMounts++

const status = ref<'pending' | 'ready'>('pending')
const count = ref(0)

onMounted(() => setTimeout(() => (status.value = 'ready'), 100))
</script>

<template>
  <div>
    <span id="child-status">{{ status }}</span>
    <span id="child-count">{{ count }}</span>
    <span id="fallback-renders">{{ counts.fallbackRenders }}</span>
    <span id="child-mounts">{{ counts.childMounts }}</span>
    <button id="child-increment" @click="count++">Increment</button>
  </div>
</template>
