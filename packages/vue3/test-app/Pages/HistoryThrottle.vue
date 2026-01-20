<script setup lang="ts">
import { Link, router } from '@inertiajs/vue3'
import { ref } from 'vue'

const callCount = ref(0)

const triggerRapidStateUpdates = () => {
  for (let i = 0; i < 120; i++) {
    callCount.value = i + 1
    router.remember({ value: i }, `key-${i}`)
  }
}
</script>

<template>
  <div>
    <h1>History Throttle Test</h1>
    <p id="call-count">State updates: {{ callCount }}</p>
    <button id="trigger" @click="triggerRapidStateUpdates">Trigger Rapid State Updates</button>
    <Link id="home-link" href="/">Go Home</Link>
  </div>
</template>
